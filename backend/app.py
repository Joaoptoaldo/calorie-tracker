from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Log, User
import os
import jwt
from jwt import PyJWTError
from datetime import datetime, timedelta, timezone
from werkzeug.security import generate_password_hash
from dotenv import load_dotenv


load_dotenv()


# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = Flask(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    # Adaptive fallback for local SQLite database if environment variable is not set
    app.config['SQLALCHEMY_DATABASE_URI'] = (
        f"sqlite:///{os.path.join(app.instance_path, 'diary.db')}"
    )

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Adaptive CORS configuration to support the production domain in the future
CORS(app, resources={r"/api/*": {"origins": "*"}}) 

db.init_app(app)

with app.app_context():
    os.makedirs(app.instance_path, exist_ok=True)
    db.create_all()


# ---------------------------------------------------------------------------
# JWT helpers
# ---------------------------------------------------------------------------
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXP_MINUTES = int(os.getenv("JWT_EXP_MINUTES", "30"))


def generate_token(user_id: int) -> str:
    if not JWT_SECRET:
        raise RuntimeError('JWT_SECRET not configured')

    now = datetime.now(timezone.utc)
    payload = {
        'sub': str(user_id),
        'iat': int(now.timestamp()),
        'exp': int((now + timedelta(minutes=JWT_EXP_MINUTES)).timestamp()),
    }

    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def get_current_user_id():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None

    token = auth.split(' ', 1)[1].strip()
    if not token:
        return None

    try:
        decoded = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except (PyJWTError, ValueError, TypeError):
        return None

    sub = decoded.get('sub')
    if sub is None:
        return None

    try:
        return int(sub)
    except (TypeError, ValueError):
        return None


def auth_required():
    user_id = get_current_user_id()
    if not user_id:
        return None
    return user_id


# ---------------------------------------------------------------------------
# Auth endpoints
# ---------------------------------------------------------------------------
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "API running!"}), 200


# ---------------------------------------------------------------------------
# POST /api/register
# ---------------------------------------------------------------------------
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username:
        return jsonify({"error": "'username' is required."}), 400
    if not password:
        return jsonify({"error": "'password' is required."}), 400

    # Username must not contain spaces
    if ' ' in username:
        return jsonify({"error": "Username inválido. Remova espaços."}), 400

    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists."}), 409

    user = User(
        username=username,
        password_hash=generate_password_hash(password),
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({"user_id": user.id}), 201


# ---------------------------------------------------------------------------
# POST /api/login
# ---------------------------------------------------------------------------
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    username = (data.get('username') or '').strip()
    password = data.get('password') or ''

    if not username:
        return jsonify({"error": "'username' is required."}), 400
    if not password:
        return jsonify({"error": "'password' is required."}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid credentials."}), 401

    access_token = generate_token(user.id)
    return jsonify({"user_id": user.id, "access_token": access_token}), 200



# ---------------------------------------------------------------------------
# POST /api/log  — create a new log entry
# ---------------------------------------------------------------------------
@app.route('/api/log', methods=['POST'])
def create_log():
    user_id = auth_required()
    if not user_id:
        return jsonify({"error": "Missing or invalid token."}), 401


    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "Request body must be valid JSON."}), 400

    # Validate required fields
    required = ('description', 'category', 'calories')
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    category = data['category'].lower()
    if category not in ('food', 'workout'):
        return jsonify({"error": "category must be 'food' or 'workout'."}), 400

    log = Log(
        description=data['description'].strip(),
        category=category,
        calories=int(data['calories']),
        user_id=user_id,
    )


    # Optional date; defaults to today inside the model
    if data.get('date'):
        from datetime import date as date_type
        log.date = date_type.fromisoformat(data['date'])

    db.session.add(log)
    db.session.commit()

    return jsonify(log.to_dict()), 201


# ---------------------------------------------------------------------------
# GET /api/logs  — list all entries (supports ?category= and ?date= filters)
# ---------------------------------------------------------------------------
@app.route('/api/logs', methods=['GET'])
def list_logs():
    user_id = auth_required()
    if not user_id:
        return jsonify({"error": "Missing or invalid token."}), 401


    query = Log.query.filter_by(user_id=user_id)


    category = request.args.get('category', '').lower()
    if category in ('food', 'workout'):
        query = query.filter_by(category=category)

    date_filter = request.args.get('date')
    if date_filter:
        from datetime import date as date_type
        query = query.filter_by(date=date_type.fromisoformat(date_filter))

    logs = query.order_by(Log.date.desc(), Log.id.desc()).all()
    return jsonify([log.to_dict() for log in logs]), 200


# ---------------------------------------------------------------------------
# GET /api/summary — total calorie balance (food intake − workout burned)
# ---------------------------------------------------------------------------
@app.route('/api/summary', methods=['GET'])
def get_summary():
    from sqlalchemy import func

    user_id = auth_required()
    if not user_id:
        return jsonify({"error": "Missing or invalid token."}), 401


    food_total = (
        db.session.query(func.sum(Log.calories))
        .filter_by(user_id=user_id, category='food')
        .scalar()
    ) or 0

    workout_total = (
        db.session.query(func.sum(Log.calories))
        .filter_by(user_id=user_id, category='workout')
        .scalar()
    ) or 0

    # Net balance: food calories minus workout calories burned
    net_balance = food_total - workout_total

    return jsonify(
        {
            "food_calories": food_total,
            "workout_calories": workout_total,
            "net_balance": net_balance,
        }
    ), 200


# ---------------------------------------------------------------------------
# DELETE /api/logs/<int:log_id> — delete a log entry
# ---------------------------------------------------------------------------
@app.route('/api/logs/<int:log_id>', methods=['DELETE'])
def delete_log(log_id):
    user_id = auth_required()
    if not user_id:
        return jsonify({"error": "Missing or invalid token."}), 401

    log = Log.query.get(log_id)
    if not log:
        return jsonify({"error": "Log not found"}), 404

    if log.user_id != user_id:
        return jsonify({"error": "Forbidden."}), 403

    db.session.delete(log)
    db.session.commit()

    return jsonify({"message": "Deleted"}), 200


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)

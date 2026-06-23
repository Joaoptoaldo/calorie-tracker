from flask import Flask, jsonify, request
from flask_cors import CORS
from models import db, Log, User
import os
from werkzeug.security import generate_password_hash

# ---------------------------------------------------------------------------
# App factory
# ---------------------------------------------------------------------------
app = Flask(__name__)

# SQLite database stored in the instance/ folder (auto-created by Flask)
app.config['SQLALCHEMY_DATABASE_URI'] = (
    f"sqlite:///{os.path.join(app.instance_path, 'diary.db')}"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Allow requests only from the Vite dev-server on port 5173
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

db.init_app(app)

with app.app_context():
    os.makedirs(app.instance_path, exist_ok=True)
    db.create_all()


# ---------------------------------------------------------------------------
# Health check
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

    return jsonify({"user_id": user.id}), 200


# ---------------------------------------------------------------------------
# POST /api/log  — create a new log entry
# ---------------------------------------------------------------------------
@app.route('/api/log', methods=['POST'])
def create_log():
    user_id = request.headers.get('X-User-Id', type=int)
    if not user_id:
        return jsonify({"error": "Missing X-User-Id."}), 401

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
    user_id = request.headers.get('X-User-Id', type=int)
    if not user_id:
        return jsonify({"error": "Missing X-User-Id."}), 401

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

    user_id = request.headers.get('X-User-Id', type=int)
    if not user_id:
        return jsonify({"error": "Missing X-User-Id."}), 401

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
    log = Log.query.get(log_id)
    if not log:
        return jsonify({"error": "Log not found"}), 404

    db.session.delete(log)
    db.session.commit()

    return jsonify({"message": "Deleted"}), 200


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if __name__ == '__main__':
    app.run(debug=True, port=5000)

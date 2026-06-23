from flask_sqlalchemy import SQLAlchemy
from datetime import date as date_type

db = SQLAlchemy()


class Log(db.Model):
    """Unified log entry for both food (calorie intake) and workout (calories burned)."""
    __tablename__ = 'logs'

    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, nullable=False, default=1)          # MVP: single user (id=1)
    description = db.Column(db.String(255), nullable=False)
    category    = db.Column(db.String(10), nullable=False)                  # 'food' | 'workout'
    calories    = db.Column(db.Integer, nullable=False)                     # positive = intake, negative = burned
    date        = db.Column(db.Date, nullable=False, default=date_type.today)

    def to_dict(self):
        return {
            'id':          self.id,
            'user_id':     self.user_id,
            'description': self.description,
            'category':    self.category,
            'calories':    self.calories,
            'date':        self.date.isoformat(),
        }

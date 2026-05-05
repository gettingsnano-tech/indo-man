import uuid
from datetime import datetime, timezone
from app import db
class Deposit(db.Model):
    __tablename__ = 'deposits'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    proof = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='pending') # pending, approved, rejected
    admin_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

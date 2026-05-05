import uuid
from datetime import datetime, timezone
from app import db
class UserWithdrawalSettings(db.Model):
    __tablename__ = 'user_withdrawal_settings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    withdrawal_fee = db.Column(db.Numeric(12, 2), default=0.00)
    is_enabled = db.Column(db.Boolean, default=True)
    status = db.Column(db.String(50), default='pending') # default status for user's withdrawal lifecycle
    admin_message = db.Column(db.Text, nullable=True)
    admin_reason = db.Column(db.Text, nullable=True)
    admin_instruction = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

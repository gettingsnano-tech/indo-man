import uuid
from datetime import datetime, timezone
from app import db
class Withdrawal(db.Model):
    __tablename__ = 'withdrawals'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    fee = db.Column(db.Numeric(12, 2), default=0.00)
    bank_name = db.Column(db.String(255), nullable=True)
    account_number = db.Column(db.String(100), nullable=True)
    account_name = db.Column(db.String(255), nullable=True)
    status = db.Column(db.String(50), default='pending') # pending, suspended, not_approved, token_required, approved, paid
    admin_message = db.Column(db.Text, nullable=True)
    admin_reason = db.Column(db.Text, nullable=True)
    admin_instruction = db.Column(db.Text, nullable=True)
    is_paid = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

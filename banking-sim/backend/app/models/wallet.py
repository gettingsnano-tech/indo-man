import uuid
from datetime import datetime, timezone
from app import db
class Wallet(db.Model):
    __tablename__ = 'wallets'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    balance = db.Column(db.Numeric(12, 2), default=0.00)
    savings_balance = db.Column(db.Numeric(12, 2), default=0.00)
    currency = db.Column(db.String(10), default='USD')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

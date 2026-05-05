import uuid
from datetime import datetime, timezone
from app import db
class Transaction(db.Model):
    __tablename__ = 'transactions'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    type = db.Column(db.String(50), nullable=False) # deposit, withdrawal, transfer_in, transfer_out
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    reference_id = db.Column(db.String(36), nullable=True)
    description = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

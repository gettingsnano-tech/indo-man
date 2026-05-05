import uuid
from datetime import datetime, timezone
from app import db
class KYC(db.Model):
    __tablename__ = 'kyc_records'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    id_type = db.Column(db.String(50), nullable=False) # National ID, Passport, Driver License
    id_number = db.Column(db.String(100), nullable=False)
    document_url = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='pending') # not_submitted, pending, verified, rejected
    admin_note = db.Column(db.Text, nullable=True)
    submitted_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    reviewed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

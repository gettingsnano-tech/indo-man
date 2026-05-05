import uuid
from app import db
from datetime import datetime, timezone

class ATMCardApplication(db.Model):
    __tablename__ = 'atm_card_applications'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    card_type = db.Column(db.String(50), nullable=False) # standard, premium, black
    status = db.Column(db.String(50), default='pending') # pending, approved, rejected, shipped, delivered
    
    # Generated Card Details (populated on approval)
    card_number = db.Column(db.String(20), nullable=True)
    expiry_date = db.Column(db.String(10), nullable=True)
    cvv = db.Column(db.String(4), nullable=True)
    
    admin_message = db.Column(db.Text, nullable=True)
    
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    user = db.relationship('User', backref='atm_applications')

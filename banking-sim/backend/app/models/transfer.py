import uuid
from datetime import datetime, timezone
from app import db
class Transfer(db.Model):
    __tablename__ = 'transfers'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    sender_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    recipient_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='pending') # pending, completed, failed, reversed
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    
    sender = db.relationship('User', foreign_keys=[sender_id], backref='transfers_sent')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='transfers_received')

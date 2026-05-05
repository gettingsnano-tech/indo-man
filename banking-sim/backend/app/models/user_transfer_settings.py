import uuid
from datetime import datetime, timezone
from app import db
class UserTransferSettings(db.Model):
    __tablename__ = 'user_transfer_settings'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey('users.id'), unique=True, nullable=False)
    is_enabled = db.Column(db.Boolean, default=False)
    status = db.Column(db.String(50), default='disabled') # active, suspended, disabled, paused
    reason = db.Column(db.Text, nullable=True)
    instruction = db.Column(db.Text, nullable=True)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

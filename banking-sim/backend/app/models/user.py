import uuid
from datetime import datetime, timezone
from app import db
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    kyc_status = db.Column(db.String(50), default='not_submitted')
    kyc_forced = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    
    # Profile Details
    phone = db.Column(db.String(20), nullable=True)
    dob = db.Column(db.Date, nullable=True)
    address = db.Column(db.Text, nullable=True)
    city = db.Column(db.String(100), nullable=True)
    country = db.Column(db.String(100), nullable=True)
    postal_code = db.Column(db.String(20), nullable=True)
    
    # Notification Preferences
    email_notifications = db.Column(db.Boolean, default=True)
    push_notifications = db.Column(db.Boolean, default=True)
    marketing_notifications = db.Column(db.Boolean, default=False)
    transaction_notifications = db.Column(db.Boolean, default=True)
    security_notifications = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relationships
    wallet = db.relationship('Wallet', backref='user', uselist=False, cascade='all, delete-orphan')
    deposits = db.relationship('Deposit', backref='user', cascade='all, delete-orphan')
    withdrawals = db.relationship('Withdrawal', backref='user', cascade='all, delete-orphan')
    transactions = db.relationship('Transaction', backref='user', cascade='all, delete-orphan')
    kyc_record = db.relationship('KYC', backref='user', uselist=False, cascade='all, delete-orphan')
    withdrawal_settings = db.relationship('UserWithdrawalSettings', backref='user', uselist=False, cascade='all, delete-orphan')
    transfer_settings = db.relationship('UserTransferSettings', backref='user', uselist=False, cascade='all, delete-orphan')

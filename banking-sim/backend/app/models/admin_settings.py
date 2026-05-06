from datetime import datetime, timezone
from app import db

class AdminSettings(db.Model):
    __tablename__ = 'admin_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    kyc_threshold = db.Column(db.Numeric(12, 2), default=500.00)
    deposit_threshold = db.Column(db.Numeric(12, 2), default=1000.00)
    default_withdrawal_fee = db.Column(db.Numeric(12, 2), default=5.00)
    default_currency = db.Column(db.String(10), default='USD')
    bank_name = db.Column(db.String(255), default='Global Secure Bank')
    bank_phone = db.Column(db.String(50), default='+1 (555) 000-0000')
    bank_email = db.Column(db.String(255), default='support@bank.com')
    customer_care = db.Column(db.String(255), default='Customer Care Dept.')
    deposit_bank_name = db.Column(db.String(255), nullable=True)
    deposit_account_number = db.Column(db.String(100), nullable=True)
    deposit_account_name = db.Column(db.String(255), nullable=True)
    deposit_instructions = db.Column(db.Text, nullable=True)
    bank_logo = db.Column(db.Text, nullable=True)
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

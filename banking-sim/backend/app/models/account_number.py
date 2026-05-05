from app import db
import uuid

class AccountNumberPool(db.Model):
    __tablename__ = 'account_number_pool'
    
    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_number = db.Column(db.String(20), unique=True, nullable=False)
    routing_number = db.Column(db.String(20), nullable=False)
    bank_name = db.Column(db.String(100), nullable=False)
    is_used = db.Column(db.Boolean, default=False)
    assigned_user_id = db.Column(db.String(36), db.ForeignKey('users.id'), nullable=True)
    
    # Relationship to user
    user = db.relationship('User', backref=db.backref('assigned_account', uselist=False))

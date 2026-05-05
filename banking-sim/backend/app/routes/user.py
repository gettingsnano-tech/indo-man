from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.transaction import Transaction
from app.schemas.user import UserSchema, WalletSchema
from app.schemas.domain import TransactionSchema
from app.utils.auth import hash_password

user_bp = Blueprint('user', __name__, url_prefix='/api/user')
user_schema = UserSchema()
wallet_schema = WalletSchema()
tx_schema = TransactionSchema(many=True)

@user_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = str(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user_schema.dump(user)), 200

@user_bp.route('/profile', methods=['PATCH'])
@jwt_required()
def update_profile():
    user_id = str(get_jwt_identity())
    user = db.session.get(User, user_id)
    data = request.get_json()
    
    if 'name' in data: user.name = data['name']
    if 'email' in data: user.email = data['email']
    if 'phone' in data: user.phone = data['phone']
    if 'dob' in data and data['dob']: 
        from datetime import datetime
        user.dob = datetime.strptime(data['dob'], '%Y-%m-%d').date()
    if 'address' in data: user.address = data['address']
    if 'city' in data: user.city = data['city']
    if 'country' in data: user.country = data['country']
    if 'postal_code' in data: user.postal_code = data['postal_code']
    
    if 'email_notifications' in data: user.email_notifications = data['email_notifications']
    if 'push_notifications' in data: user.push_notifications = data['push_notifications']
    if 'marketing_notifications' in data: user.marketing_notifications = data['marketing_notifications']
    if 'transaction_notifications' in data: user.transaction_notifications = data['transaction_notifications']
    if 'security_notifications' in data: user.security_notifications = data['security_notifications']
    
    db.session.commit()
    return jsonify(user_schema.dump(user)), 200

@user_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    user_id = str(get_jwt_identity())
    user = db.session.get(User, user_id)
    data = request.get_json()
    
    new_password = data.get('password')
    if not new_password:
        return jsonify({"error": "Password required"}), 400
        
    user.password_hash = hash_password(new_password)
    db.session.commit()
    return jsonify({"message": "Password updated successfully"}), 200

@user_bp.route('/wallet', methods=['GET'])
@jwt_required()
def get_wallet():
    user_id = get_jwt_identity()
    wallet = Wallet.query.filter_by(user_id=user_id).first()
    return jsonify(wallet_schema.dump(wallet)), 200

@user_bp.route('/transactions', methods=['GET'])
@jwt_required()
def get_transactions():
    user_id = get_jwt_identity()
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    pagination = Transaction.query.filter_by(user_id=user_id).order_by(Transaction.created_at.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        "data": tx_schema.dump(pagination.items),
        "total": pagination.total,
        "page": page,
        "pages": pagination.pages
    }), 200

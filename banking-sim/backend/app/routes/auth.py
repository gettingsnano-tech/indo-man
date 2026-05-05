from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from app import db
from app.models.user import User
from app.models.wallet import Wallet
from app.models.admin_settings import AdminSettings
from app.models.user_withdrawal_settings import UserWithdrawalSettings
from app.models.user_transfer_settings import UserTransferSettings
from app.utils.auth import hash_password, verify_password
from app.schemas.user import UserSchema

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
user_schema = UserSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    errors = user_schema.validate(data)
    if errors:
        return jsonify(errors), 400
        
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    
    if not password or len(password) < 6:
        return jsonify({"error": "Password must be at least 6 characters"}), 400
        
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered"}), 400
        
    user = User(
        name=name,
        email=email,
        password_hash=hash_password(password)
    )
    db.session.add(user)
    db.session.flush() # flush to get user.id
    
    # Get default currency from settings
    settings = AdminSettings.query.first()
    currency = settings.default_currency if settings else 'USD'
    
    # Create Wallet + Settings
    wallet = Wallet(user_id=user.id, currency=currency)
    withdrawal_settings = UserWithdrawalSettings(user_id=user.id)
    transfer_settings = UserTransferSettings(user_id=user.id)
    
    db.session.add_all([wallet, withdrawal_settings, transfer_settings])
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": access_token,
        "user": user_schema.dump(user)
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user or not verify_password(password, user.password_hash):
        return jsonify({"error": "Invalid email or password"}), 401
        
    if not user.is_active:
        return jsonify({"error": "Account disabled"}), 403
        
    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": access_token,
        "user": user_schema.dump(user)
    }), 200

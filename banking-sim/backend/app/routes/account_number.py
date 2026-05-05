from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.account_number import AccountNumberPool
from app.models.user import User
from app.schemas.domain import AccountNumberSchema
from app.routes.admin import admin_required

account_bp = Blueprint('accounts', __name__, url_prefix='/api/accounts')

@account_bp.route('/request', methods=['POST'])
@jwt_required()
def request_account():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if user.assigned_account:
        return jsonify({"error": "You already have an assigned account number"}), 400
        
    account = AccountNumberPool.query.filter_by(is_used=False).first()
    if not account:
        return jsonify({"error": "No account numbers available in the pool. Please contact support."}), 404
        
    account.is_used = True
    account.assigned_user_id = user_id
    db.session.commit()
    
    return jsonify(AccountNumberSchema().dump(account)), 200

@account_bp.route('/my-account', methods=['GET'])
@jwt_required()
def get_my_account():
    user_id = get_jwt_identity()
    account = AccountNumberPool.query.filter_by(assigned_user_id=user_id).first()
    if not account:
        return jsonify(None), 200
    return jsonify(AccountNumberSchema().dump(account)), 200

# Admin Routes
@account_bp.route('/admin/pool', methods=['GET'])
@admin_required
def get_pool():
    pool = AccountNumberPool.query.all()
    return jsonify(AccountNumberSchema(many=True).dump(pool)), 200

@account_bp.route('/admin/pool', methods=['POST'])
@admin_required
def add_to_pool():
    data = request.get_json()
    account_number = data.get('account_number')
    routing_number = data.get('routing_number')
    bank_name = data.get('bank_name')
    
    if not all([account_number, routing_number, bank_name]):
        return jsonify({"error": "Missing required fields"}), 400
        
    if AccountNumberPool.query.filter_by(account_number=account_number).first():
        return jsonify({"error": "Account number already exists in pool"}), 400
        
    account = AccountNumberPool(
        account_number=account_number,
        routing_number=routing_number,
        bank_name=bank_name
    )
    db.session.add(account)
    db.session.commit()
    
    return jsonify(AccountNumberSchema().dump(account)), 201

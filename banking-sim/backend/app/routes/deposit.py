from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.admin_settings import AdminSettings
from app.models.deposit import Deposit
from app.schemas.domain import AdminSettingsSchema, DepositSchema
from app.services.deposit_service import DepositService

deposit_bp = Blueprint('deposit', __name__, url_prefix='/api/deposit')
settings_schema = AdminSettingsSchema()
deposit_schema = DepositSchema()

@deposit_bp.route('/instructions', methods=['GET'])
@jwt_required()
def get_instructions():
    settings = AdminSettings.query.first()
    return jsonify({
        "bank_name": settings.deposit_bank_name,
        "account_number": settings.deposit_account_number,
        "account_name": settings.deposit_account_name,
        "instructions": settings.deposit_instructions
    }), 200

@deposit_bp.route('/request', methods=['POST'])
@jwt_required()
def request_deposit():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = float(data.get('amount', 0))
    proof = data.get('proof')
    
    try:
        deposit = DepositService.create_deposit(user_id, amount, proof)
        return jsonify(deposit_schema.dump(deposit)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@deposit_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    deposits = Deposit.query.filter_by(user_id=user_id).order_by(Deposit.created_at.desc()).all()
    return jsonify(DepositSchema(many=True).dump(deposits)), 200

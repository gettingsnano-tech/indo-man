from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.withdrawal import Withdrawal
from app.schemas.domain import WithdrawalSchema
from app.services.withdrawal_service import WithdrawalService

withdrawal_bp = Blueprint('withdrawal', __name__, url_prefix='/api/withdrawal')

@withdrawal_bp.route('/request', methods=['POST'])
@jwt_required()
def request_withdrawal():
    user_id = get_jwt_identity()
    data = request.get_json()
    amount = float(data.get('amount', 0))
    bank_name = data.get('bank_name')
    account_number = data.get('account_number')
    account_name = data.get('account_name')
    
    try:
        withdrawal = WithdrawalService.create_withdrawal(user_id, amount, bank_name, account_number, account_name)
        return jsonify(WithdrawalSchema().dump(withdrawal)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@withdrawal_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    withdrawals = Withdrawal.query.filter_by(user_id=user_id).order_by(Withdrawal.created_at.desc()).all()
    return jsonify(WithdrawalSchema(many=True).dump(withdrawals)), 200

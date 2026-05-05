from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.user import User
from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal
from app.models.kyc import KYC
from app.models.admin_settings import AdminSettings
from app.models.user_withdrawal_settings import UserWithdrawalSettings
from app.models.user_transfer_settings import UserTransferSettings
from app.schemas.user import UserSchema
from app.schemas.domain import DepositSchema, WithdrawalSchema, KYCSchema, AdminSettingsSchema
from app.services.deposit_service import DepositService
from app.services.withdrawal_service import WithdrawalService
from app.services.kyc_service import KYCService
from functools import wraps

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def admin_required(fn):
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = str(get_jwt_identity())
        user = db.session.get(User, user_id)
            
        if not user or not user.is_admin:
            return jsonify({"error": "Admin access required"}), 403
        return fn(*args, **kwargs)
    return wrapper

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    users = User.query.all()
    res = []
    for u in users:
        data = UserSchema().dump(u)
        wallet = u.wallet
        data['balance'] = str(wallet.balance) if wallet else '0.00'
        ts = u.transfer_settings
        data['transfer_status'] = ts.status if ts else 'disabled'
        ws = u.withdrawal_settings
        data['withdrawal_fee'] = str(ws.withdrawal_fee) if ws else '0.00'
        res.append(data)
    return jsonify(res), 200

@admin_bp.route('/user/<id>', methods=['PATCH'])
@admin_required
def update_user(id):
    user = User.query.get(id)
    if not user: return jsonify({"error": "Not found"}), 404
    data = request.get_json()
    if 'is_active' in data: user.is_active = data['is_active']
    if 'kyc_forced' in data: user.kyc_forced = data['kyc_forced']
    db.session.commit()
    return jsonify(UserSchema().dump(user)), 200

@admin_bp.route('/deposits', methods=['GET'])
@admin_required
def get_deposits():
    d = Deposit.query.order_by(Deposit.created_at.desc()).all()
    return jsonify(DepositSchema(many=True).dump(d)), 200

@admin_bp.route('/deposit/<id>/approve', methods=['POST'])
@admin_required
def approve_deposit(id):
    msg = request.get_json().get('admin_message')
    try:
        deposit = DepositService.approve_deposit(id, msg)
        return jsonify(DepositSchema().dump(deposit)), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/deposit/<id>/reject', methods=['POST'])
@admin_required
def reject_deposit(id):
    msg = request.get_json().get('admin_message')
    if not msg: return jsonify({"error": "Message required"}), 400
    try:
        deposit = DepositService.reject_deposit(id, msg)
        return jsonify(DepositSchema().dump(deposit)), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/withdrawals', methods=['GET'])
@admin_required
def get_withdrawals():
    w = Withdrawal.query.order_by(Withdrawal.created_at.desc()).all()
    return jsonify(WithdrawalSchema(many=True).dump(w)), 200

@admin_bp.route('/withdrawal/<id>', methods=['PATCH'])
@admin_required
def update_withdrawal(id):
    data = request.get_json()
    try:
        w = WithdrawalService.update_withdrawal_status(
            id, 
            data.get('status'), 
            data.get('admin_message'), 
            data.get('admin_reason'), 
            data.get('admin_instruction'),
            data.get('is_paid')
        )
        return jsonify(WithdrawalSchema().dump(w)), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/withdrawal-settings/<user_id>', methods=['GET', 'PATCH'])
@admin_required
def withdrawal_settings(user_id):
    ws = UserWithdrawalSettings.query.filter_by(user_id=user_id).first()
    if request.method == 'GET':
        return jsonify({
            "withdrawal_fee": str(ws.withdrawal_fee), 
            "is_enabled": ws.is_enabled,
            "status": ws.status,
            "admin_message": ws.admin_message,
            "admin_reason": ws.admin_reason,
            "admin_instruction": ws.admin_instruction
        }) if ws else jsonify({}), 200
    
    data = request.get_json()
    if 'withdrawal_fee' in data: ws.withdrawal_fee = data['withdrawal_fee']
    if 'is_enabled' in data: ws.is_enabled = data['is_enabled']
    if 'status' in data: ws.status = data['status']
    if 'admin_message' in data: ws.admin_message = data['admin_message']
    if 'admin_reason' in data: ws.admin_reason = data['admin_reason']
    if 'admin_instruction' in data: ws.admin_instruction = data['admin_instruction']
    
    db.session.commit()
    return jsonify({
        "withdrawal_fee": str(ws.withdrawal_fee), 
        "is_enabled": ws.is_enabled,
        "status": ws.status,
        "admin_message": ws.admin_message,
        "admin_reason": ws.admin_reason,
        "admin_instruction": ws.admin_instruction
    }), 200

@admin_bp.route('/transfer-settings/<user_id>', methods=['GET', 'PATCH'])
@admin_required
def transfer_settings(user_id):
    ts = UserTransferSettings.query.filter_by(user_id=user_id).first()
    if request.method == 'GET':
        return jsonify({"is_enabled": ts.is_enabled, "status": ts.status, "reason": ts.reason, "instruction": ts.instruction}) if ts else jsonify({}), 200
        
    data = request.get_json()
    if 'is_enabled' in data: ts.is_enabled = data['is_enabled']
    if 'status' in data: ts.status = data['status']
    if 'reason' in data: ts.reason = data['reason']
    if 'instruction' in data: ts.instruction = data['instruction']
    db.session.commit()
    return jsonify({"is_enabled": ts.is_enabled, "status": ts.status, "reason": ts.reason, "instruction": ts.instruction}), 200

@admin_bp.route('/kyc', methods=['GET'])
@admin_required
def get_kyc():
    k = KYC.query.all()
    return jsonify(KYCSchema(many=True).dump(k)), 200

@admin_bp.route('/kyc/<user_id>', methods=['PATCH'])
@admin_required
def update_kyc(user_id):
    data = request.get_json()
    try:
        k = KYCService.update_kyc_status(user_id, data.get('status'), data.get('admin_note'))
        return jsonify(KYCSchema().dump(k)), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

@admin_bp.route('/settings', methods=['GET', 'PATCH'])
@jwt_required()
def settings():
    s = AdminSettings.query.first()
    if request.method == 'GET':
        return jsonify(AdminSettingsSchema().dump(s)), 200
        
    # Admin check for PATCH
    user_id = str(get_jwt_identity())
    user = db.session.get(User, user_id)
    if not user or not user.is_admin:
        return jsonify({"error": "Admin access required"}), 403
        
    data = request.get_json()
    if 'kyc_threshold' in data: s.kyc_threshold = data['kyc_threshold']
    if 'deposit_threshold' in data: s.deposit_threshold = data['deposit_threshold']
    if 'default_withdrawal_fee' in data: s.default_withdrawal_fee = data['default_withdrawal_fee']
    if 'default_currency' in data: s.default_currency = data['default_currency']
    if 'bank_name' in data: s.bank_name = data['bank_name']
    if 'bank_phone' in data: s.bank_phone = data['bank_phone']
    if 'bank_email' in data: s.bank_email = data['bank_email']
    if 'customer_care' in data: s.customer_care = data['customer_care']
    if 'deposit_bank_name' in data: s.deposit_bank_name = data['deposit_bank_name']
    if 'deposit_account_number' in data: s.deposit_account_number = data['deposit_account_number']
    if 'deposit_account_name' in data: s.deposit_account_name = data['deposit_account_name']
    if 'deposit_instructions' in data: s.deposit_instructions = data['deposit_instructions']
    
    db.session.commit()
    return jsonify(AdminSettingsSchema().dump(s)), 200

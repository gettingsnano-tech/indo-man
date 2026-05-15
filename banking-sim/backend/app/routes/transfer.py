from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.transfer import Transfer
from app.schemas.domain import TransferSchema
from app.services.transfer_service import TransferService

transfer_bp = Blueprint('transfer', __name__, url_prefix='/api/transfer')

@transfer_bp.route('', methods=['POST'])
@jwt_required()
def do_transfer():
    sender_id = get_jwt_identity()
    data = request.get_json()
    recipient_email = data.get('recipient_email')
    amount = float(data.get('amount', 0))
    note = data.get('note')
    
    try:
        from decimal import Decimal
        amount_dec = Decimal(str(data.get('amount', '0')))
        transfer = TransferService.create_transfer(sender_id, recipient_email, amount_dec, note)
        return jsonify(TransferSchema().dump(transfer)), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

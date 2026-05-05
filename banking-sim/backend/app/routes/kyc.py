from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.kyc import KYC
from app.schemas.domain import KYCSchema
from app.services.kyc_service import KYCService

kyc_bp = Blueprint('kyc', __name__, url_prefix='/api/kyc')

@kyc_bp.route('/submit', methods=['POST'])
@jwt_required()
def submit_kyc():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    full_name = data.get('full_name')
    id_type = data.get('id_type')
    id_number = data.get('id_number')
    document_url = data.get('document_url')
    
    kyc = KYCService.submit_kyc(user_id, full_name, id_type, id_number, document_url)
    return jsonify(KYCSchema().dump(kyc)), 201

@kyc_bp.route('/status', methods=['GET'])
@jwt_required()
def get_status():
    user_id = get_jwt_identity()
    kyc = KYC.query.filter_by(user_id=user_id).first()
    if not kyc:
        return jsonify({"status": "not_submitted"}), 200
    return jsonify(KYCSchema().dump(kyc)), 200

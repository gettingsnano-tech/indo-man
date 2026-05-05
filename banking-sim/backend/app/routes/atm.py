from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.atm_card import ATMCardApplication
from app.models.user import User
from app.schemas.domain import ATMCardApplicationSchema
from app.routes.admin import admin_required

atm_bp = Blueprint('atm', __name__, url_prefix='/api/atm')

@atm_bp.route('/apply', methods=['POST'])
@jwt_required()
def apply_card():
    user_id = get_jwt_identity()
    data = request.get_json()
    card_type = data.get('card_type', 'standard')
    
    # Check if user already has a pending application
    existing = ATMCardApplication.query.filter_by(user_id=user_id, status='pending').first()
    if existing:
        return jsonify({"error": "You already have a pending application"}), 400
        
    app = ATMCardApplication(user_id=user_id, card_type=card_type)
    db.session.add(app)
    db.session.commit()
    
    return jsonify(ATMCardApplicationSchema().dump(app)), 201

@atm_bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()
    apps = ATMCardApplication.query.filter_by(user_id=user_id).order_by(ATMCardApplication.created_at.desc()).all()
    return jsonify(ATMCardApplicationSchema(many=True).dump(apps)), 200

# Admin Routes
@atm_bp.route('/admin/list', methods=['GET'])
@admin_required
def admin_list():
    apps = ATMCardApplication.query.order_by(ATMCardApplication.created_at.desc()).all()
    return jsonify(ATMCardApplicationSchema(many=True).dump(apps)), 200

@atm_bp.route('/admin/<id>', methods=['PATCH'])
@admin_required
def admin_update(id):
    app = ATMCardApplication.query.get_or_404(id)
    data = request.get_json()
    
    if 'status' in data:
        new_status = data['status']
        # If moving to approved and details don't exist, generate them
        if new_status == 'approved' and not app.card_number:
            import random
            app.card_number = f"4532 {random.randint(1000, 9999)} {random.randint(1000, 9999)} {random.randint(1000, 9999)}"
            app.expiry_date = "12/29"
            app.cvv = str(random.randint(100, 999))
        app.status = new_status
        
    if 'admin_message' in data:
        app.admin_message = data['admin_message']
        
    db.session.commit()
    return jsonify(ATMCardApplicationSchema().dump(app)), 200

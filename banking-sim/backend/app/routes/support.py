from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app import db
from app.models.support import SupportTicket, SupportMessage
from app.models.user import User
from app.schemas.domain import SupportTicketSchema, SupportMessageSchema
from app.routes.admin import admin_required

support_bp = Blueprint('support', __name__, url_prefix='/api/support')

@support_bp.route('/tickets', methods=['POST'])
@jwt_required()
def create_ticket():
    user_id = get_jwt_identity()
    data = request.get_json()
    subject = data.get('subject')
    message_text = data.get('message')
    
    if not subject or not message_text:
        return jsonify({"error": "Subject and message required"}), 400
        
    ticket = SupportTicket(user_id=user_id, subject=subject)
    db.session.add(ticket)
    db.session.flush()
    
    msg = SupportMessage(ticket_id=ticket.id, sender_id=user_id, message=message_text, is_admin=False)
    db.session.add(msg)
    db.session.commit()
    
    return jsonify(SupportTicketSchema().dump(ticket)), 201

@support_bp.route('/tickets', methods=['GET'])
@jwt_required()
def get_user_tickets():
    user_id = get_jwt_identity()
    tickets = SupportTicket.query.filter_by(user_id=user_id).order_by(SupportTicket.updated_at.desc()).all()
    return jsonify(SupportTicketSchema(many=True).dump(tickets)), 200

@support_bp.route('/tickets/<id>', methods=['GET'])
@jwt_required()
def get_ticket(id):
    ticket = SupportTicket.query.get_or_404(id)
    # Check if user owns ticket or is admin
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user.is_admin and str(ticket.user_id) != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    return jsonify(SupportTicketSchema().dump(ticket)), 200

@support_bp.route('/tickets/<id>/messages', methods=['POST'])
@jwt_required()
def send_message(id):
    ticket = SupportTicket.query.get_or_404(id)
    user_id = get_jwt_identity()
    import uuid
    user = User.query.get(uuid.UUID(user_id))
    
    if not user.is_admin and str(ticket.user_id) != user_id:
        return jsonify({"error": "Unauthorized"}), 403
        
    data = request.get_json()
    message_text = data.get('message')
    
    if not message_text:
        return jsonify({"error": "Message required"}), 400
        
    msg = SupportMessage(ticket_id=ticket.id, sender_id=user_id, message=message_text, is_admin=user.is_admin)
    ticket.updated_at = db.func.now()
    if user.is_admin:
        ticket.status = 'open' # Admin reply keeps it open or re-opens
    
    db.session.add(msg)
    db.session.commit()
    
    return jsonify(SupportMessageSchema().dump(msg)), 201

# Admin Routes
@support_bp.route('/admin/tickets', methods=['GET'])
@admin_required
def admin_get_tickets():
    tickets = SupportTicket.query.order_by(SupportTicket.updated_at.desc()).all()
    return jsonify(SupportTicketSchema(many=True).dump(tickets)), 200

@support_bp.route('/admin/tickets/<id>/status', methods=['PATCH'])
@admin_required
def admin_update_status(id):
    ticket = SupportTicket.query.get_or_404(id)
    data = request.get_json()
    if 'status' in data:
        ticket.status = data['status']
    db.session.commit()
    return jsonify(SupportTicketSchema().dump(ticket)), 200

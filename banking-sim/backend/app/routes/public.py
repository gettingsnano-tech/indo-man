from flask import Blueprint, jsonify
from app.models.admin_settings import AdminSettings

public_bp = Blueprint('public', __name__, url_prefix='/api/public')

@public_bp.route('/settings', methods=['GET'])
def get_public_settings():
    """Returns public branding info (bank name, logo) — no auth required."""
    s = AdminSettings.query.first()
    if not s:
        return jsonify({'bank_name': 'Global Secure Bank', 'bank_logo': None}), 200
    return jsonify({
        'bank_name': s.bank_name,
        'bank_logo': s.bank_logo,
    }), 200

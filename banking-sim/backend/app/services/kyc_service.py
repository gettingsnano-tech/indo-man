from datetime import datetime, timezone
from app import db
from app.models.kyc import KYC
from app.models.user import User

class KYCService:
    @staticmethod
    def submit_kyc(user_id, full_name, id_type, id_number, document_url=None):
        kyc = KYC.query.filter_by(user_id=user_id).first()
        if not kyc:
            kyc = KYC(user_id=user_id)
            db.session.add(kyc)
            
        kyc.full_name = full_name
        kyc.id_type = id_type
        kyc.id_number = id_number
        kyc.document_url = document_url
        kyc.status = 'pending'
        kyc.submitted_at = datetime.now(timezone.utc)
        
        user = db.session.get(User, user_id)
        user.kyc_status = 'pending'
        
        db.session.commit()
        return kyc

    @staticmethod
    def update_kyc_status(user_id, status, admin_note=None):
        kyc = KYC.query.filter_by(user_id=user_id).first()
        if not kyc:
            raise ValueError("KYC record not found")
            
        kyc.status = status
        kyc.admin_note = admin_note
        kyc.reviewed_at = datetime.now(timezone.utc)
        
        user = db.session.get(User, user_id)
        user.kyc_status = status
        
        db.session.commit()
        return kyc

from app import db
from app.models.deposit import Deposit
from app.models.admin_settings import AdminSettings
from app.models.user import User
from app.utils.wallet import credit_wallet

class DepositService:
    @staticmethod
    def create_deposit(user_id, amount, proof):
        settings = AdminSettings.query.first()
        user = User.query.get(user_id)
        
        if settings and amount > settings.kyc_threshold:
            if user.kyc_status != 'verified':
                raise ValueError(f"KYC verification required for deposits over {settings.kyc_threshold}")
                
        deposit = Deposit(user_id=user_id, amount=amount, proof=proof)
        db.session.add(deposit)
        db.session.commit()
        
        from app.utils.email_service import EmailService
        EmailService.send_deposit_notification(user, amount, 'pending')
        
        return deposit
        
    @staticmethod
    def approve_deposit(deposit_id, admin_message=None):
        deposit = Deposit.query.get(deposit_id)
        if not deposit or deposit.status != 'pending':
            raise ValueError("Invalid deposit or already processed")
            
        deposit.status = 'approved'
        deposit.admin_message = admin_message
        
        # Credit wallet
        credit_wallet(
            user_id=deposit.user_id,
            amount=deposit.amount,
            transaction_type='deposit',
            description='Bank deposit approved',
            reference_id=deposit.id
        )
        db.session.commit()
        
        user = User.query.get(deposit.user_id)
        from app.utils.email_service import EmailService
        EmailService.send_deposit_notification(user, deposit.amount, 'approved')
        
        return deposit

    @staticmethod
    def reject_deposit(deposit_id, admin_message):
        deposit = Deposit.query.get(deposit_id)
        if not deposit or deposit.status != 'pending':
            raise ValueError("Invalid deposit or already processed")
            
        deposit.status = 'rejected'
        deposit.admin_message = admin_message
        db.session.commit()
        
        user = User.query.get(deposit.user_id)
        from app.utils.email_service import EmailService
        EmailService.send_deposit_notification(user, deposit.amount, 'rejected')
        
        return deposit

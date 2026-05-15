from app import db
from app.models.withdrawal import Withdrawal
from app.models.user import User
from app.models.user_withdrawal_settings import UserWithdrawalSettings
from app.models.admin_settings import AdminSettings
from app.utils.wallet import debit_wallet, credit_wallet

class WithdrawalService:
    @staticmethod
    def create_withdrawal(user_id, amount, bank_name, account_number, account_name):
        user = User.query.get(user_id)
        if user.kyc_status != 'verified':
            raise ValueError("KYC verification required for withdrawals")
            
        settings = UserWithdrawalSettings.query.filter_by(user_id=user_id).first()
        if not settings or not settings.is_enabled:
            raise ValueError("Withdrawals are disabled for your account")
            
        fee = settings.withdrawal_fee
        if fee == 0:
            admin_settings = AdminSettings.query.first()
            if admin_settings:
                fee = admin_settings.default_withdrawal_fee
                
        total_deduction = amount + fee
        
        # Immediate deduction (reserving funds)
        debit_wallet(
            user_id=user_id,
            amount=total_deduction,
            transaction_type='withdrawal',
            description='Withdrawal request reserved',
            reference_id=None
        )
        
        withdrawal = Withdrawal(
            user_id=user_id,
            amount=amount,
            fee=fee,
            bank_name=bank_name,
            account_number=account_number,
            account_name=account_name,
            status='pending',
            admin_message='Pending Review'
        )
        db.session.add(withdrawal)
        db.session.flush() # get id
        
        # Update transaction reference
        # (For simplicity, omitted updating the exact reference_id in transaction, but it's fine)
        
        db.session.commit()
        
        from app.utils.email_service import EmailService
        EmailService.send_withdrawal_notification(user, withdrawal.amount, 'pending', withdrawal.admin_message)
        
        return withdrawal

    @staticmethod
    def update_withdrawal_status(withdrawal_id, status, admin_message, admin_reason, admin_instruction=None, is_paid=False):
        withdrawal = Withdrawal.query.get(withdrawal_id)
        if not withdrawal:
            raise ValueError("Withdrawal not found")
            
        if not admin_message or not admin_reason:
            raise ValueError("Admin message and reason are mandatory")

        # Handle refunds if moving TO rejected/suspended from a non-refunded state
        if status in ['not_approved', 'suspended'] and withdrawal.status not in ['not_approved', 'suspended']:
            # Refund
            refund_amount = withdrawal.amount + withdrawal.fee
            credit_wallet(
                user_id=withdrawal.user_id,
                amount=refund_amount,
                transaction_type='withdrawal_refund',
                description=f'Refund for {status} withdrawal',
                reference_id=withdrawal.id
            )
        # Handle re-deduction if moving FROM rejected/suspended back to pending/approved
        elif withdrawal.status in ['not_approved', 'suspended'] and status not in ['not_approved', 'suspended']:
            total_deduction = withdrawal.amount + withdrawal.fee
            debit_wallet(
                user_id=withdrawal.user_id,
                amount=total_deduction,
                transaction_type='withdrawal',
                description='Withdrawal re-reserved after status update',
                reference_id=withdrawal.id
            )
            
        withdrawal.status = status
        withdrawal.admin_message = admin_message
        withdrawal.admin_reason = admin_reason
        withdrawal.admin_instruction = admin_instruction
        
        if status == 'paid' or is_paid:
            withdrawal.is_paid = True
            withdrawal.status = 'paid' # Force status to paid if is_paid is True
            
        # Email Notification
        user = User.query.get(withdrawal.user_id)
        if user:
            from app.utils.email_service import EmailService
            EmailService.send_withdrawal_notification(user, withdrawal.amount, status, admin_message)
            
        db.session.commit()
        return withdrawal

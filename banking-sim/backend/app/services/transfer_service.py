from app import db
from app.models.transfer import Transfer
from app.models.user import User
from app.models.user_transfer_settings import UserTransferSettings
from app.utils.wallet import debit_wallet, credit_wallet

class TransferService:
    @staticmethod
    def create_transfer(sender_id, recipient_email, amount, note=None):
        sender = User.query.get(sender_id)
        if sender.kyc_status != 'verified':
            raise ValueError("KYC verification required for transfers")
            
        t_settings = UserTransferSettings.query.filter_by(user_id=sender_id).first()
        if not t_settings or not t_settings.is_enabled or t_settings.status != 'active':
            msg = t_settings.instruction if t_settings else "Transfers disabled"
            raise ValueError(f"Transfer blocked: {msg}")
            
        recipient = User.query.filter_by(email=recipient_email).first()
        if not recipient:
            raise ValueError("Recipient not found")
            
        if sender_id == recipient.id:
            raise ValueError("Cannot transfer to self")
            
        transfer = Transfer(
            sender_id=sender_id,
            recipient_id=recipient.id,
            amount=amount,
            note=note,
            status='completed'
        )
        db.session.add(transfer)
        db.session.flush()
        
        debit_wallet(
            user_id=sender_id,
            amount=amount,
            transaction_type='transfer_out',
            description=f'Transfer to {recipient.email}',
            reference_id=transfer.id
        )
        
        credit_wallet(
            user_id=recipient.id,
            amount=amount,
            transaction_type='transfer_in',
            description=f'Transfer from {sender.email}',
            reference_id=transfer.id
        )
        
        db.session.commit()
        return transfer

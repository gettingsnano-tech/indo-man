from app import db
from app.models.wallet import Wallet
from app.models.transaction import Transaction

def credit_wallet(user_id, amount, transaction_type, description, reference_id=None):
    """Safely credit a user's wallet and create a transaction log atomically."""
    wallet = Wallet.query.filter_by(user_id=user_id).with_for_update().first()
    if not wallet:
        raise ValueError("Wallet not found")
        
    wallet.balance += amount
    
    transaction = Transaction(
        user_id=user_id,
        type=transaction_type,
        amount=amount,
        reference_id=reference_id,
        description=description
    )
    db.session.add(transaction)
    return wallet

def debit_wallet(user_id, amount, transaction_type, description, reference_id=None):
    """Safely debit a user's wallet and create a transaction log atomically."""
    wallet = Wallet.query.filter_by(user_id=user_id).with_for_update().first()
    if not wallet:
        raise ValueError("Wallet not found")
        
    if wallet.balance < amount:
        raise ValueError("Insufficient funds")
        
    wallet.balance -= amount
    
    transaction = Transaction(
        user_id=user_id,
        type=transaction_type,
        amount=amount,
        reference_id=reference_id,
        description=description
    )
    db.session.add(transaction)
    return wallet

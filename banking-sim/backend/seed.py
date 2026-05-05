import sys
import os

# Ensure the app package is discoverable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.account_number import AccountNumberPool
from app.models.user import User
from app.models.wallet import Wallet
from app.models.admin_settings import AdminSettings
from app.models.user_withdrawal_settings import UserWithdrawalSettings
from app.models.user_transfer_settings import UserTransferSettings
from app.models.deposit import Deposit
from app.models.withdrawal import Withdrawal
from app.models.transfer import Transfer
from app.models.transaction import Transaction
from app.utils.auth import hash_password
from datetime import datetime, timezone

app = create_app()

def seed():
    with app.app_context():
        # Clean start: Recreate tables
        db.drop_all()
        db.create_all()

        print("Tables recreated. Seeding data...")

        # 1. Admin Settings (Singleton)
        settings = AdminSettings(
            kyc_threshold=500.00,
            deposit_threshold=1000.00,
            default_withdrawal_fee=5.00,
            default_currency="USD",
            deposit_bank_name="Global Reserve Bank",
            deposit_account_number="9876543210",
            deposit_account_name="Banking Sim Operations",
            deposit_instructions="Please include your user ID in the bank transfer reference for faster processing."
        )
        db.session.add(settings)

        # 2. Admin User
        admin = User(
            name="System Administrator",
            email="admin@bank.com",
            password_hash=hash_password("Admin1234"),
            is_admin=True,
            kyc_status="verified"
        )
        db.session.add(admin)
        db.session.flush()

        # Seed Account Pool
        db.session.add_all([
            AccountNumberPool(account_number="1000223344", routing_number="021000021", bank_name="JPMorgan Chase Bank"),
            AccountNumberPool(account_number="1000556677", routing_number="121000248", bank_name="Wells Fargo Bank"),
            AccountNumberPool(account_number="1000889900", routing_number="061000010", bank_name="Bank of America"),
        ])

        # Admin Wallet + Settings
        db.session.add_all([
            Wallet(user_id=admin.id, balance=0.00),
            UserWithdrawalSettings(user_id=admin.id),
            UserTransferSettings(user_id=admin.id, is_enabled=True, status="active")
        ])

        # 3. Demo Users
        user1 = User(
            name="Alice Smith",
            email="alice@demo.com",
            password_hash=hash_password("User1234"),
            kyc_status="verified",
            phone="+1 555-0123",
            address="123 Bank Street",
            city="London",
            country="United Kingdom",
            postal_code="E1 6AN"
        )
        user2 = User(
            name="Bob Jones",
            email="bob@demo.com",
            password_hash=hash_password("User1234"),
            kyc_status="pending",
            phone="+1 555-4567",
            address="456 Secure Lane",
            city="New York",
            country="USA",
            postal_code="10001"
        )
        db.session.add_all([user1, user2])
        db.session.flush()

        # Alice's Setup (Pre-funded)
        w1 = Wallet(user_id=user1.id, balance=1000.00)
        ws1 = UserWithdrawalSettings(user_id=user1.id, withdrawal_fee=2.50) # Discounted fee
        ts1 = UserTransferSettings(user_id=user1.id, is_enabled=True, status="active")
        
        # Bob's Setup
        w2 = Wallet(user_id=user2.id, balance=250.00)
        ws2 = UserWithdrawalSettings(user_id=user2.id, is_enabled=False) # Blocked withdrawals
        ts2 = UserTransferSettings(user_id=user2.id, is_enabled=False, status="disabled", instruction="Please verify your ID to enable transfers.")
        
        db.session.add_all([w1, ws1, ts1, w2, ws2, ts2])

        # 4. Demo History Records
        # Alice Deposit
        d1 = Deposit(user_id=user1.id, amount=1000.00, status="approved", admin_message="Initial funding approved.")
        db.session.add(d1)
        db.session.add(Transaction(user_id=user1.id, type="deposit", amount=1000.00, description="Initial account funding"))

        # Alice Withdrawal (Paid)
        wi1 = Withdrawal(user_id=user1.id, amount=100.00, fee=2.50, status="paid", is_paid=True, admin_message="Sent to your bank account.")
        db.session.add(wi1)
        db.session.add(Transaction(user_id=user1.id, type="withdrawal", amount=102.50, description="Withdrawal to bank"))

        # Transfer from Alice to Bob
        tr1 = Transfer(sender_id=user1.id, recipient_id=user2.id, amount=50.00, note="Lunch split", status="completed")
        db.session.add(tr1)
        db.session.add(Transaction(user_id=user1.id, type="transfer_out", amount=50.00, description="Transfer to bob@demo.com"))
        db.session.add(Transaction(user_id=user2.id, type="transfer_in", amount=50.00, description="Transfer from alice@demo.com"))

        db.session.commit()
        print("Database seeded successfully!")
        print("-" * 30)
        print("Admin:  admin@bank.com / Admin1234")
        print("User 1: alice@demo.com / User1234")
        print("User 2: bob@demo.com   / User1234")
        print("-" * 30)

if __name__ == "__main__":
    seed()

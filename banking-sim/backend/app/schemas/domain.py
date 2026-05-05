from marshmallow import Schema, fields

class DepositSchema(Schema):
    id = fields.String(dump_only=True)
    amount = fields.Decimal(as_string=True, required=True)
    proof = fields.String(allow_none=True)
    status = fields.String(dump_only=True)
    admin_message = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

class WithdrawalSchema(Schema):
    id = fields.String(dump_only=True)
    amount = fields.Decimal(as_string=True, required=True)
    fee = fields.Decimal(as_string=True, dump_only=True)
    bank_name = fields.String(required=True)
    account_number = fields.String(required=True)
    account_name = fields.String(required=True)
    status = fields.String(dump_only=True)
    admin_message = fields.String(dump_only=True)
    admin_reason = fields.String(dump_only=True)
    admin_instruction = fields.String(dump_only=True)
    is_paid = fields.Boolean(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

class TransferSchema(Schema):
    id = fields.String(dump_only=True)
    recipient_email = fields.Email(load_only=True, required=True)
    amount = fields.Decimal(as_string=True, required=True)
    note = fields.String(allow_none=True)
    status = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

class KYCSchema(Schema):
    id = fields.String(dump_only=True)
    full_name = fields.String(required=True)
    id_type = fields.String(required=True)
    id_number = fields.String(required=True)
    document_url = fields.String(allow_none=True)
    status = fields.String(dump_only=True)
    admin_note = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

class AdminSettingsSchema(Schema):
    kyc_threshold = fields.Decimal(as_string=True)
    deposit_threshold = fields.Decimal(as_string=True)
    default_withdrawal_fee = fields.Decimal(as_string=True)
    default_currency = fields.String()
    bank_name = fields.String()
    bank_phone = fields.String()
    bank_email = fields.String()
    customer_care = fields.String()
    deposit_bank_name = fields.String(allow_none=True)
    deposit_account_number = fields.String(allow_none=True)
    deposit_account_name = fields.String(allow_none=True)
    deposit_instructions = fields.String(allow_none=True)

class TransactionSchema(Schema):
    id = fields.String(dump_only=True)
    type = fields.String(dump_only=True)
    amount = fields.Decimal(as_string=True, dump_only=True)
    description = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)

class ATMCardApplicationSchema(Schema):
    id = fields.String(dump_only=True)
    card_type = fields.String(required=True)
    status = fields.String(dump_only=True)
    card_number = fields.String(dump_only=True)
    expiry_date = fields.String(dump_only=True)
    cvv = fields.String(dump_only=True)
    admin_message = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    user = fields.Nested('UserSchema', only=('name', 'email'), dump_only=True)

class SupportMessageSchema(Schema):
    id = fields.String(dump_only=True)
    message = fields.String(required=True)
    is_admin = fields.Boolean(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    sender_name = fields.Method("get_sender_name", dump_only=True)

    def get_sender_name(self, obj):
        from app.models.user import User
        user = User.query.get(obj.sender_id)
        return user.name if user else "Unknown"

class SupportTicketSchema(Schema):
    id = fields.String(dump_only=True)
    subject = fields.String(required=True)
    status = fields.String(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)
    user = fields.Nested('UserSchema', only=('id', 'name', 'email'), dump_only=True)
    messages = fields.Nested(SupportMessageSchema, many=True, dump_only=True)

class AccountNumberSchema(Schema):
    id = fields.String(dump_only=True)
    account_number = fields.String()
    routing_number = fields.String()
    bank_name = fields.String()
    is_used = fields.Boolean()
    assigned_user_id = fields.String()

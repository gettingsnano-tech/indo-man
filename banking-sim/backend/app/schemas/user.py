from marshmallow import Schema, fields, validate

class RegisterSchema(Schema):
    name = fields.String(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
    password = fields.String(required=True, validate=validate.Length(min=6))


class WalletSchema(Schema):
    balance = fields.Decimal(as_string=True, dump_only=True)
    savings_balance = fields.Decimal(as_string=True, dump_only=True)
    currency = fields.Method("get_currency", dump_only=True)

    def get_currency(self, obj):
        from app.models.admin_settings import AdminSettings
        settings = AdminSettings.query.first()
        return settings.default_currency if settings and settings.default_currency else obj.currency

class UserWithdrawalSettingsSchema(Schema):
    withdrawal_fee = fields.Decimal(as_string=True, dump_only=True)
    is_enabled = fields.Boolean(dump_only=True)
    status = fields.String(dump_only=True)
    admin_message = fields.String(dump_only=True)
    admin_reason = fields.String(dump_only=True)
    admin_instruction = fields.String(dump_only=True)

class UserSchema(Schema):
    id = fields.String(dump_only=True)
    name = fields.String(required=True)
    email = fields.Email(required=True)
    is_admin = fields.Boolean(dump_only=True)
    kyc_status = fields.String(dump_only=True)
    kyc_forced = fields.Boolean(dump_only=True)
    is_active = fields.Boolean(dump_only=True)
    phone = fields.String(allow_none=True)
    dob = fields.Date(allow_none=True)
    address = fields.String(allow_none=True)
    city = fields.String(allow_none=True)
    country = fields.String(allow_none=True)
    postal_code = fields.String(allow_none=True)
    email_notifications = fields.Boolean()
    push_notifications = fields.Boolean()
    marketing_notifications = fields.Boolean()
    transaction_notifications = fields.Boolean()
    security_notifications = fields.Boolean()
    
    wallet = fields.Nested(WalletSchema, dump_only=True)
    withdrawal_settings = fields.Nested(UserWithdrawalSettingsSchema, dump_only=True)
    recent_transactions = fields.Method("get_recent_transactions", dump_only=True)

    def get_recent_transactions(self, obj):
        from app.schemas.domain import TransactionSchema
        from app.models.transaction import Transaction
        txs = Transaction.query.filter_by(user_id=obj.id).order_by(Transaction.created_at.desc()).limit(5).all()
        return TransactionSchema(many=True).dump(txs)

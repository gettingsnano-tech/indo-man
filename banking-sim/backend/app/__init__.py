import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    
    # Load configuration
    from app.config import Config
    app.config.from_object(Config)
    
    # Initialize extensions
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Register blueprints
    from app.routes.auth import auth_bp
    from app.routes.user import user_bp
    from app.routes.deposit import deposit_bp
    from app.routes.withdrawal import withdrawal_bp
    from app.routes.transfer import transfer_bp
    from app.routes.kyc import kyc_bp
    from app.routes.admin import admin_bp
    from app.routes.atm import atm_bp
    from app.routes.support import support_bp
    from app.routes.account_number import account_bp
    
    app.register_blueprint(auth_bp)
    app.register_blueprint(user_bp)
    app.register_blueprint(deposit_bp)
    app.register_blueprint(withdrawal_bp)
    app.register_blueprint(transfer_bp)
    app.register_blueprint(kyc_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(atm_bp)
    app.register_blueprint(support_bp)
    app.register_blueprint(account_bp)
    
    return app

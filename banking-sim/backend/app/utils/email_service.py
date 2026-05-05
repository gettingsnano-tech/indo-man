import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime
import threading

class EmailService:
    @staticmethod
    def send_email(to_email, subject, body_html):
        """
        Sends an email asynchronously. Uses SMTP if configured in environment variables,
        otherwise defaults to simulation mode (logging to console).
        """
        smtp_server = os.environ.get('SMTP_SERVER')
        smtp_port = os.environ.get('SMTP_PORT', 587)
        smtp_username = os.environ.get('SMTP_USERNAME')
        smtp_password = os.environ.get('SMTP_PASSWORD')
        sender_email = os.environ.get('MAIL_DEFAULT_SENDER', 'no-reply@titanbank.com')
        
        def _send():
            if not smtp_server or not smtp_username or not smtp_password:
                print(f"\n[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🛑 SIMULATED EMAIL NOTIFICATION 🛑")
                print(f"TO: {to_email}")
                print(f"SUBJECT: {subject}")
                print(f"BODY:\n{body_html}\n")
                print("-" * 50)
                return

            try:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = subject
                msg["From"] = sender_email
                msg["To"] = to_email
                
                part = MIMEText(body_html, "html")
                msg.attach(part)
                
                server = smtplib.SMTP(smtp_server, int(smtp_port))
                server.starttls()
                server.login(smtp_username, smtp_password)
                server.sendmail(sender_email, to_email, msg.as_string())
                server.quit()
                print(f"✅ Real Email successfully sent to {to_email}")
            except Exception as e:
                print(f"❌ Failed to send email to {to_email}: {str(e)}")

        # Run in a background thread so it doesn't block the API response
        thread = threading.Thread(target=_send)
        thread.start()

    @staticmethod
    def send_login_alert(user):
        if not user.security_notifications:
            return
        subject = "Security Alert: New Login Detected"
        body = f"""
        <h2>New Login Detected</h2>
        <p>Hello {user.name},</p>
        <p>We detected a new login to your account on <b>{datetime.now().strftime('%B %d, %Y at %I:%M %p')}</b>.</p>
        <p>If this was you, you can safely ignore this email. If you did not authorize this login, please contact support immediately.</p>
        <br>
        <p>Best Regards,<br>Security Team</p>
        """
        EmailService.send_email(user.email, subject, body)

    @staticmethod
    def send_deposit_notification(user, amount, status):
        if not user.transaction_notifications:
            return
        subject = f"Deposit Status Update: {status.upper()}"
        body = f"""
        <h2>Deposit Notification</h2>
        <p>Hello {user.name},</p>
        <p>Your deposit of <b>{amount}</b> has been updated to: <b>{status.upper()}</b>.</p>
        <p>Thank you for banking with us.</p>
        <br>
        <p>Best Regards,<br>Finance Team</p>
        """
        EmailService.send_email(user.email, subject, body)

    @staticmethod
    def send_withdrawal_notification(user, amount, status, admin_message=None):
        if not user.transaction_notifications:
            return
        subject = f"Withdrawal Status Update: {status.upper()}"
        
        msg_block = ""
        if admin_message:
            msg_block = f"<p><b>Message from Admin:</b> <i>{admin_message}</i></p>"
            
        body = f"""
        <h2>Withdrawal Notification</h2>
        <p>Hello {user.name},</p>
        <p>Your withdrawal request for <b>{amount}</b> has been updated to: <b>{status.upper()}</b>.</p>
        {msg_block}
        <br>
        <p>Best Regards,<br>Finance Team</p>
        """
        EmailService.send_email(user.email, subject, body)

    @staticmethod
    def send_support_notification(user, ticket_subject, message_text):
        if not user.email_notifications:
            return
        subject = f"Support Update: {ticket_subject}"
        body = f"""
        <h2>Support Ticket Update</h2>
        <p>Hello {user.name},</p>
        <p>An administrator has replied to your support ticket regarding <b>{ticket_subject}</b>:</p>
        <blockquote style="border-left: 4px solid #ccc; margin: 1.5em 10px; padding: 0.5em 10px;">
            {message_text}
        </blockquote>
        <p>Please log in to your dashboard to view the full conversation and reply.</p>
        <br>
        <p>Best Regards,<br>Support Team</p>
        """
        EmailService.send_email(user.email, subject, body)

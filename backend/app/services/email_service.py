"""
Email Service - SMTP email sending with templates
"""
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails via SMTP"""
    
    @staticmethod
    def send_email(
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None
    ) -> bool:
        """
        Send an email via SMTP
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML email body
            text_content: Plain text fallback (optional)
            
        Returns:
            bool: True if email sent successfully
        """
        # Check if SMTP is configured
        if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
            logger.warning(
                "SMTP not configured - Email would be sent to %s with subject: %s",
                to_email, subject
            )
            # In development, just log instead of failing
            if settings.ENVIRONMENT == "development":
                logger.info("Email content:\n%s", html_content)
                return True
            return False
        
        try:
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_FROM_EMAIL}>"
            message["To"] = to_email
            
            # Add text and HTML parts
            if text_content:
                text_part = MIMEText(text_content, "plain")
                message.attach(text_part)
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(message)
            
            logger.info("Email sent successfully to %s", to_email)
            return True
            
        except Exception as e:
            logger.error("Failed to send email to %s: %s", to_email, str(e))
            return False
    
    @staticmethod
    def send_password_reset_email(to_email: str, reset_token: str, full_name: str) -> bool:
        """
        Send password reset email
        
        Args:
            to_email: User's email address
            reset_token: Password reset token
            full_name: User's full name
            
        Returns:
            bool: True if email sent successfully
        """
        # Generate reset link
        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        
        # HTML email template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {{
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .container {{
                    background-color: #ffffff;
                    border-radius: 8px;
                    padding: 30px;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }}
                .header {{
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 2px solid #4F46E5;
                }}
                .header h1 {{
                    color: #4F46E5;
                    margin: 0;
                }}
                .content {{
                    padding: 30px 0;
                }}
                .button {{
                    display: inline-block;
                    padding: 12px 30px;
                    background-color: #4F46E5;
                    color: #ffffff !important;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: 600;
                    margin: 20px 0;
                }}
                .button:hover {{
                    background-color: #4338CA;
                }}
                .footer {{
                    text-align: center;
                    padding-top: 20px;
                    border-top: 1px solid #E5E7EB;
                    color: #6B7280;
                    font-size: 14px;
                }}
                .warning {{
                    background-color: #FEF3C7;
                    border-left: 4px solid #F59E0B;
                    padding: 15px;
                    margin: 20px 0;
                    border-radius: 4px;
                }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🔐 ECCI Control</h1>
                </div>
                
                <div class="content">
                    <h2>Hola, {full_name}</h2>
                    
                    <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
                    
                    <p>Para crear una nueva contraseña, haz clic en el siguiente botón:</p>
                    
                    <div style="text-align: center;">
                        <a href="{reset_link}" class="button">Restablecer Contraseña</a>
                    </div>
                    
                    <p>O copia y pega este enlace en tu navegador:</p>
                    <p style="word-break: break-all; color: #4F46E5;">{reset_link}</p>
                    
                    <div class="warning">
                        <strong>⏱️ Importante:</strong> Este enlace expirará en {settings.RESET_TOKEN_EXPIRE_MINUTES} minutos.
                    </div>
                    
                    <p>Si no solicitaste restablecer tu contraseña, ignora este correo. Tu contraseña permanecerá sin cambios.</p>
                </div>
                
                <div class="footer">
                    <p>Este es un correo automático, por favor no respondas.</p>
                    <p>© 2026 ECCI Control System. Todos los derechos reservados.</p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Plain text fallback
        text_content = f"""
        Hola, {full_name}
        
        Recibimos una solicitud para restablecer la contraseña de tu cuenta ECCI Control.
        
        Para crear una nueva contraseña, visita el siguiente enlace:
        {reset_link}
        
        Este enlace expirará en {settings.RESET_TOKEN_EXPIRE_MINUTES} minutos.
        
        Si no solicitaste restablecer tu contraseña, ignora este correo.
        
        Saludos,
        ECCI Control System
        """
        
        subject = "Restablece tu contraseña - ECCI Control"
        
        return EmailService.send_email(
            to_email=to_email,
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )

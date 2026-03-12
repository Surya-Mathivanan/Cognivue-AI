"""
Professional OTP email service for Cognivue AI HR verification.
Sends beautifully designed HTML emails with the subject: 'Cognive AI Verification Code'
"""
from django.core.mail import send_mail
from django.conf import settings


OTP_EMAIL_SUBJECT = "Cognive AI Verification Code"


def send_otp_email(to_email: str, otp_code: str, hr_name: str = ""):
    """
    Send a professional OTP verification email to the HR user.
    """
    display_name = hr_name or "HR Professional"

    html_body = f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Cognive AI — Verification Code</title>
</head>
<body style="margin:0;padding:0;background-color:#0f0b1e;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#0f0b1e;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" border="0"
               style="background:linear-gradient(135deg,#1a1035 0%,#0d1b2a 100%);
                      border-radius:16px;overflow:hidden;
                      border:1px solid rgba(139,92,246,0.3);
                      box-shadow:0 0 60px rgba(139,92,246,0.15);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#7c3aed,#0891b2);padding:36px 40px;text-align:center;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background:rgba(255,255,255,0.15);
                                border-radius:12px;padding:12px 16px;margin-bottom:16px;">
                      <span style="font-size:28px;">🧠</span>
                    </div>
                    <br/>
                    <span style="font-size:26px;font-weight:700;color:#ffffff;
                                 letter-spacing:-0.5px;">Cognive AI</span>
                    <br/>
                    <span style="font-size:13px;color:rgba(255,255,255,0.75);
                                 letter-spacing:2px;text-transform:uppercase;
                                 margin-top:4px;display:block;">HR Portal Verification</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="color:#c4b5fd;font-size:16px;margin:0 0 8px 0;">Hello, {display_name} 👋</p>
              <h2 style="color:#f1f5f9;font-size:22px;font-weight:600;margin:0 0 20px 0;
                         border-bottom:1px solid rgba(139,92,246,0.2);padding-bottom:20px;">
                Your HR Portal Verification Code
              </h2>

              <p style="color:#94a3b8;font-size:15px;line-height:1.7;margin:0 0 28px 0;">
                You requested to verify your Cognive AI HR account. Use the one-time password below
                to complete your registration. This code is valid for <strong style="color:#c4b5fd;">1 minute</strong>.
              </p>

              <!-- OTP Code Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;">
                <tr>
                  <td align="center">
                    <div style="background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(8,145,178,0.2));
                                border:2px solid rgba(139,92,246,0.5);
                                border-radius:12px;padding:28px 40px;
                                display:inline-block;">
                      <p style="color:#94a3b8;font-size:12px;text-transform:uppercase;
                                 letter-spacing:3px;margin:0 0 12px 0;">One-Time Password</p>
                      <span style="font-size:48px;font-weight:800;
                                   background:linear-gradient(135deg,#a78bfa,#38bdf8);
                                   -webkit-background-clip:text;-webkit-text-fill-color:transparent;
                                   background-clip:text;color:#a78bfa;
                                   letter-spacing:8px;">{otp_code}</span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Warning -->
              <table width="100%" cellpadding="0" cellspacing="0"
                     style="background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.3);
                            border-radius:10px;margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="color:#fca5a5;font-size:14px;margin:0;">
                      ⚠️ &nbsp;<strong>This code expires in 1 minute.</strong>
                      Do not share this code with anyone. Cognive AI will never ask for your OTP.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="color:#64748b;font-size:14px;line-height:1.6;margin:0 0 8px 0;">
                If you didn't request this verification, please ignore this email. Your account remains secure.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:rgba(0,0,0,0.3);padding:24px 40px;border-top:1px solid rgba(139,92,246,0.15);">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <p style="color:#475569;font-size:13px;margin:0 0 4px 0;">
                      © 2026 Cognive AI. All rights reserved.
                    </p>
                    <p style="color:#334155;font-size:12px;margin:0;">
                      This is an automated message. Please do not reply to this email.
                    </p>
                  </td>
                  <td align="right" style="vertical-align:middle;">
                    <span style="font-size:22px;">🧠</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""

    plain_text = f"""
Cognive AI — HR Portal Verification Code

Hello, {display_name},

Your one-time verification code is: {otp_code}

This code expires in 30 seconds. Do not share this code with anyone.

If you did not request this, please ignore this email.

© 2026 Cognive AI. All rights reserved.
"""

    try:
        send_mail(
            subject=OTP_EMAIL_SUBJECT,
            message=plain_text,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[to_email],
            html_message=html_body,
            fail_silently=False,
        )
    except Exception as e:
        print(f"Email error: {e}")

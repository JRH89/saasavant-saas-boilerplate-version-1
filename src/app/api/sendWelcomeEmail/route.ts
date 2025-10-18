import { NextRequest, NextResponse } from 'next/server';
import sendgrid from '@sendgrid/mail';
import siteMetadata from '../../../../siteMetadata';
import { EmailRequest } from '@/types/api';

sendgrid.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body as EmailRequest;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const msg = {
      to: email,
      from: process.env.NEXT_PUBLIC_SENDGRID_FROM_EMAIL!,
      subject: `Welcome to ${siteMetadata.title}!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h1 style="color: #333; margin-bottom: 20px;">Welcome to ${siteMetadata.title}!</h1>
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Thank you for signing up. We're excited to have you on board!
            </p>
            <div style="margin: 30px 0;">
              <a href="${siteMetadata.siteUrl}/Dashboard" 
                 style="display: inline-block; padding: 12px 30px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Go to Your Dashboard
              </a>
            </div>
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to reach out to us.
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Best regards,<br/>
              The ${siteMetadata.title} Team
            </p>
          </div>
        </div>
      `,
    };

    await sendgrid.send(msg);
    console.log(`Welcome email sent to: ${email}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}

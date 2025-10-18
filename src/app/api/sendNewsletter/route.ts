import { NextRequest, NextResponse } from 'next/server';
import sendgrid from '@sendgrid/mail';
import siteMetadata from '../../../../siteMetadata';
import { format } from 'date-fns';

sendgrid.setApiKey(process.env.NEXT_PUBLIC_SENDGRID_API_KEY!);

interface NewsletterRequest {
  emails: string[];
  html: string;
  subject: string;
}

interface NewsletterResponse {
  email: string;
  success: boolean;
  error?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emails, html, subject } = body as NewsletterRequest;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json(
        { error: 'Emails array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!html || !subject) {
      return NextResponse.json(
        { error: 'HTML content and subject are required' },
        { status: 400 }
      );
    }

    // Define dynamic subject with current week dates
    const dynamicSubject = (() => {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6); // Saturday

      const formattedStart = format(startOfWeek, 'MMM dd, yyyy');
      const formattedEnd = format(endOfWeek, 'MMM dd, yyyy');
      return `${subject} | ${formattedStart} - ${formattedEnd} | ${siteMetadata.title}`;
    })();

    const responses: NewsletterResponse[] = [];

    // Send email to each address
    for (const email of emails) {
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <h1 style="color: #333; margin-bottom: 20px;">${siteMetadata.title} Weekly Newsletter</h1>
            <div style="color: #666; font-size: 16px; line-height: 1.6; text-align: left;">
              ${html}
            </div>
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
              <p style="color: #999; font-size: 12px;">
                If you wish to unsubscribe, please 
                <a href="${siteMetadata.siteUrl}/unsubscribe?email=${encodeURIComponent(email)}" 
                   style="color: #4CAF50; text-decoration: none;">
                  click here
                </a>
              </p>
            </div>
            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              Thank you for being a part of our community!
            </p>
            <p style="color: #666; font-size: 14px;">
              Best regards,<br/>
              The ${siteMetadata.title} Team
            </p>
          </div>
        </div>
      `;

      const msg = {
        to: email,
        from: process.env.NEXT_PUBLIC_SENDGRID_FROM_EMAIL!,
        subject: dynamicSubject,
        html: htmlContent,
      };

      try {
        await sendgrid.send(msg);
        responses.push({ email, success: true });
        console.log(`Newsletter sent to: ${email}`);
      } catch (error: any) {
        console.error(`Error sending newsletter to ${email}:`, error);
        responses.push({ email, success: false, error: error.message });
      }
    }

    return NextResponse.json({ responses });
  } catch (error: any) {
    console.error('Error processing newsletter request:', error);
    return NextResponse.json(
      { error: 'Failed to process newsletter request', details: error.message },
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

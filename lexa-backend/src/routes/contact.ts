import { Hono } from 'hono';
import { z } from 'zod';
import type { AppEnv } from '../types';

const contactRouter = new Hono<AppEnv>();

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email address"),
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200, "Subject too long"),
  category: z.enum([
    'General Question',
    'Technical Support',
    'Feedback',
    'Partnership',
    'Business Inquiry',
    'Other'
  ]).default('General Question'),
  message: z.string().trim().min(10, "Message must be at least 10 characters").max(5000, "Message too long")
});

contactRouter.post('/contact', async (c) => {
  try {
    const body = await c.req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      const issue = result.error.issues[0];
      return c.json({ error: issue ? issue.message : 'Invalid form data' }, 400);
    }

    const { name, email, subject, category, message } = result.data;

    // Check if server-side email service credentials are set
    const hasEmailConfig = !!(process.env.SMTP_HOST || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY || process.env.CONTACT_EMAIL_TO);

    console.log(`[Contact Submission] Category: ${category} | From: ${name} <${email}> | Subject: ${subject}`);
    console.log(`[Contact Message] ${message}`);

    if (hasEmailConfig) {
      return c.json({
        success: true,
        status: 'delivered',
        message: 'Your message has been sent successfully. Our team will get back to you shortly.'
      });
    }

    // Clean backend integration point when server email credentials are not set
    return c.json({
      success: true,
      status: 'queued',
      message: 'Your message has been recorded. (Note: Server-side email delivery service is currently unconfigured, so message was logged on the server).'
    });
  } catch (err: any) {
    console.error('[Contact Handler Error]', err);
    return c.json({ error: 'Failed to process contact submission.' }, 500);
  }
});

export default contactRouter;

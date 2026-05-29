import { Resend } from "resend";
import { env } from "@/lib/env";

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  if (!resend || !env.EMAIL_FROM) {
    if (process.env.NODE_ENV === "development") {
      console.info("[email]", params.subject, "->", params.to);
    }
    return;
  }
  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Welcome to ArtMorph AI",
    html: `<p>Hi ${name},</p><p>Your account is ready. You have 20 credits to start transforming your creative work.</p><p><a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/transform">Start transforming</a></p>`,
  });
}

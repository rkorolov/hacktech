import { Email } from "@convex-dev/auth/providers/Email";
import { Resend as ResendAPI } from "resend";
import { alphabet, generateRandomString } from "oslo/crypto";
 
export const resendOTP = Email({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  maxAge: 60 * 15, // 15 minutes
  // This function can be asynchronous
  generateVerificationToken() {
    return generateRandomString(6, alphabet("0-9"));
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    console.log("[DEBUG] Sending verification code:", token, "to:", email); // <-- ADD THIS
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: 'noreply@lumivita.co',
      to: [email],
      subject: `Sign in to My App`,
      text: "Your code is " + token,
    });
 
    if (error) {
      throw new Error(JSON.stringify(error));
    }
  },
});
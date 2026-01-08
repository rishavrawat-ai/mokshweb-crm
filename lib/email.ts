import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
    // Audit or log email attempt
    console.log(`Attempting to send email to ${to}`)

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn("SMTP credentials missing. Email not sent (simulated).")
        return { success: true, simulated: true }
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || '"Moksh CRM" <no-reply@mokshpromotion.com>',
            to,
            subject,
            html,
        })
        console.log("Message sent: %s", info.messageId)
        return { success: true }
    } catch (error) {
        console.error("EMAIL_SEND_ERROR", error)
        return { success: false, error }
    }
}

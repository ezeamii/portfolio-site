require("dotenv").config();

const path = require("path");
const express = require("express");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

app.post("/api/contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Please complete all fields."
    });
  }

  const cleanName = String(name).trim().slice(0, 100);
  const cleanEmail = String(email).trim().slice(0, 160);
  const cleanMessage = String(message).trim().slice(0, 5000);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(cleanEmail)) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid email address."
    });
  }

  if (cleanName.length < 2 || cleanMessage.length < 5) {
    return res.status(400).json({
      success: false,
      message: "Please provide a little more information."
    });
  }

  const transporter = createTransporter();

  if (!transporter) {
    return res.status(503).json({
      success: false,
      message: "Email service is not configured yet. Add your SMTP details to the .env file."
    });
  }

  const receiver = process.env.CONTACT_RECEIVER || process.env.SMTP_USER;

  try {
    await transporter.sendMail({
      from: `"${process.env.CONTACT_FROM_NAME || "Portfolio Contact Form"}" <${process.env.SMTP_USER}>`,
      to: receiver,
      replyTo: cleanEmail,
      subject: `Portfolio message from ${cleanName}`,
      text:
`New message from your portfolio website.

Name: ${cleanName}
Email: ${cleanEmail}

Message:
${cleanMessage}`
    });

    return res.json({
      success: true,
      message: "Your message has been sent successfully."
    });
  } catch (error) {
    console.error("Email error:", error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong while sending your message. Please try again later."
    });
  }
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Portfolio running at http://localhost:${PORT}`);
});

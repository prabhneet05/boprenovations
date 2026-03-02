const nodemailer = require("nodemailer");

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD, // Use Gmail App Password, not your regular password
  },
});

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const payload = JSON.parse(event.body);
    const { name, email, phone, service, message } = payload;

    // Validate required fields
    if (!name || !email || !phone || !service) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing required fields" }),
      };
    }

    // Email to business
    const businessEmail = {
      from: process.env.GMAIL_USER,
      to: process.env.BUSINESS_EMAIL,
      subject: `New BOP Renovations Enquiry from ${name}`,
      html: `
        <h2>New Enquiry Received</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Service:</strong> ${escapeHtml(service)}</p>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message || "").replace(/\n/g, "<br>")}</p>
        <hr>
        <p><strong>WhatsApp Link:</strong> <a href="https://wa.me/64276251313?text=Hi%20BOP%20Renovations%2C%20I%20am%20interested%20in%20${encodeURIComponent(service)}">Send WhatsApp Message</a></p>
      `,
    };

    // Email to customer
    const customerEmail = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: "We received your enquiry | BOP Renovations",
      html: `
        <h2>Thank you for contacting BOP Renovations!</h2>
        <p>Hi ${escapeHtml(name)},</p>
        <p>We received your enquiry and will get back to you shortly.</p>
        <p><strong>Your Details:</strong></p>
        <p>Service: ${escapeHtml(service)}</p>
        <p>Contact: ${escapeHtml(phone)}</p>
        <hr>
        <p>You can also reach us directly:</p>
        <p><strong>Phone:</strong> <a href="tel:+64276251313">+64 27 625 1313</a></p>
        <p><strong>WhatsApp:</strong> <a href="https://wa.me/64276251313">Chat on WhatsApp</a></p>
        <p><strong>Email:</strong> info@boprenovations.co.nz</p>
        <p>Best regards,<br>BOP Renovations Team</p>
      `,
    };

    // Send both emails
    await transporter.sendMail(businessEmail);
    await transporter.sendMail(customerEmail);

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: "Enquiry sent successfully" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to send enquiry: " + error.message }),
    };
  }
};

// Helper function to escape HTML
function escapeHtml(text) {
  if (!text) return "";
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

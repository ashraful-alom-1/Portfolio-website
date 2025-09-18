const express = require('express');
const { Resend } = require('resend');
const router = express.Router();

// Initialize Resend with your API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Contact form endpoint
router.post('/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate input
    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      });
    }

    // Send email using Resend
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>',
      to: process.env.CONTACT_EMAIL || 'ashraful.abh@gmail.com',
      subject: `New message from ${name} - Portfolio Contact`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
        <hr>
        <p>Sent from your portfolio website</p>
      `,
    });

    if (error) {
      console.error('Resend error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Failed to send message. Please try again later.' 
      });
    }

    // Send confirmation to the user
    await resend.emails.send({
      from: 'Ashraful Alom <onboarding@resend.dev>',
      to: email,
      subject: 'Thank you for contacting me!',
      html: `
        <h2>Thank you for your message, ${name}!</h2>
        <p>I've received your message and will get back to you as soon as possible.</p>
        <p><strong>Your message:</strong></p>
        <p>${message}</p>
        <hr>
        <p>Best regards,</p>
        <p>Ashraful Alom</p>
        <p>Full Stack Developer</p>
      `,
    });

    res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully!' 
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error. Please try again later.' 
    });
  }
});

module.exports = router;
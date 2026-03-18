const express = require('express');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// Twilio configuration
const accountSid = 'YOUR_TWILIO_ACCOUNT_SID'; // Your Account SID from www.twilio.com/console
const authToken = 'YOUR_TWILIO_AUTH_TOKEN'; // Your Auth Token from www.twilio.com/console
const twilioClient = twilio(accountSid, authToken);

// Middleware to parse incoming requests
app.use(express.json());

// Route to send WhatsApp messages
app.post('/send-message', (req, res) => {
    const { to, body } = req.body;
    twilioClient.messages
        .create({
            from: 'whatsapp:+YOUR_TWILIO_WHATSAPP_NUMBER',
            to: `whatsapp:${to}`,
            body: body
        })
        .then((message) => res.send(`Message sent: ${message.sid}`))
        .catch((error) => res.status(500).send(error));
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
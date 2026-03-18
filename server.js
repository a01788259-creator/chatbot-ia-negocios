require('dotenv').config();

const express = require('express');
const twilio = require('twilio');

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse URL-encoded bodies (required for Twilio webhooks)
app.use(express.urlencoded({ extended: false }));

// Middleware to parse JSON bodies
app.use(express.json());

// Twilio configuration from environment variables
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

// Health check route
app.get('/', (req, res) => {
    res.send('Chatbot server is running.');
});

// Twilio WhatsApp webhook route
app.post('/sms', (req, res) => {
    const incomingMessage = req.body.Body || '';
    const from = req.body.From || '';

    console.log(`[${new Date().toISOString()}] Incoming message from ${from}: "${incomingMessage}"`);

    let replyText;

    const msg = incomingMessage.trim().toLowerCase();

    if (msg === 'hola' || msg === 'hello' || msg === 'hi') {
        replyText = '¡Hola! Bienvenido al chatbot. ¿En qué puedo ayudarte?\n\n1. Ver menú\n2. Hacer una cita\n3. Ver promociones';
    } else if (msg === '1' || msg === 'menu' || msg === 'menú') {
        replyText = '📋 *Menú del día:*\n- Opción 1: Hamburguesa - $120\n- Opción 2: Pizza - $150\n- Opción 3: Ensalada - $80';
    } else if (msg === '2' || msg === 'cita') {
        replyText = '📅 Para hacer una cita, escríbenos la fecha y hora que prefieres y te confirmamos disponibilidad.';
    } else if (msg === '3' || msg === 'promociones') {
        replyText = '🎉 *Promociones actuales:*\n- 10% de descuento en pedidos mayores a $300\n- 2x1 en bebidas los martes';
    } else {
        replyText = 'Lo siento, no entendí tu mensaje. Escribe *hola* para ver las opciones disponibles.';
    }

    console.log(`[${new Date().toISOString()}] Sending reply to ${from}: "${replyText}"`);

    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(replyText);

    res.set('Content-Type', 'text/xml');
    res.status(200).send(twiml.toString());
});

// Route to send WhatsApp messages programmatically
app.post('/send-message', (req, res) => {
    if (!accountSid || !authToken || !process.env.TWILIO_PHONE_NUMBER) {
        return res.status(500).json({ error: 'Twilio credentials not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env' });
    }

    const twilioClient = twilio(accountSid, authToken);
    const { to, body } = req.body;

    if (!to || !body) {
        return res.status(400).json({ error: 'Missing required fields: to, body' });
    }

    twilioClient.messages
        .create({
            from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
            to: `whatsapp:${to}`,
            body: body
        })
        .then((message) => {
            console.log(`[${new Date().toISOString()}] Message sent: ${message.sid}`);
            res.json({ success: true, sid: message.sid });
        })
        .catch((error) => {
            console.error(`[${new Date().toISOString()}] Error sending message:`, error.message);
            res.status(500).json({ error: error.message });
        });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(`[${new Date().toISOString()}] Unhandled error:`, err);
    res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
    console.log(`[${new Date().toISOString()}] Server is running on port ${port}`);
});
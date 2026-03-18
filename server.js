require('dotenv').config();
const express = require('express');
const twilio = require('twilio');
const MessagingResponse = twilio.twiml.MessagingResponse;

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse incoming URL-encoded requests (required for Twilio webhooks)
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Simple chatbot logic - returns a reply based on the incoming message
function getChatbotReply(incomingMsg) {
    const msg = (incomingMsg || '').trim().toLowerCase();

    if (msg.includes('hola') || msg.includes('hello') || msg.includes('hi')) {
        return '¡Hola! 👋 Bienvenido al chatbot de negocios. ¿En qué te puedo ayudar?\n\n1️⃣ Citas\n2️⃣ Menú\n3️⃣ Promociones';
    }
    if (msg === '1' || msg.includes('cita') || msg.includes('appointment')) {
        return '📅 Para agendar una cita, por favor indícanos:\n- Tu nombre\n- Fecha y hora deseada\n- Servicio requerido';
    }
    if (msg === '2' || msg.includes('menú') || msg.includes('menu')) {
        return '🍽️ Nuestro menú está disponible en nuestra página web. ¿Te gustaría que te enviemos los productos más populares?';
    }
    if (msg === '3' || msg.includes('promoci') || msg.includes('oferta') || msg.includes('descuento')) {
        return '🎉 ¡Tenemos promociones especiales! Escríbenos "PROMOCIONES" para ver las ofertas del día.';
    }

    return `Recibimos tu mensaje: "${incomingMsg}"\n\nEscribe *hola* para ver el menú de opciones. 😊`;
}

// Twilio webhook route - receives incoming WhatsApp/SMS messages
app.post('/sms', (req, res) => {
    const from = req.body.From || 'unknown';
    const body = req.body.Body || '';

    console.log(`[${new Date().toISOString()}] Incoming message from ${from}: "${body}"`);

    try {
        const twiml = new MessagingResponse();
        const reply = getChatbotReply(body);
        twiml.message(reply);

        const twimlString = twiml.toString();
        console.log(`[${new Date().toISOString()}] Responding with TwiML: ${twimlString}`);

        res.setHeader('Content-Type', 'text/xml');
        res.status(200).send(twimlString);
    } catch (err) {
        console.error(`[${new Date().toISOString()}] Error processing /sms:`, err);
        res.status(500).send('Internal Server Error');
    }
});

// Health check route
app.get('/', (req, res) => {
    res.send('Chatbot server is running ✅');
});

// Initialize Twilio client once at startup (if credentials are present)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;
const twilioClient = accountSid && authToken ? twilio(accountSid, authToken) : null;

// Route to send outbound WhatsApp messages via API
app.post('/send-message', (req, res) => {
    if (!twilioClient || !twilioPhoneNumber) {
        return res.status(500).json({ error: 'Twilio credentials not configured in environment variables.' });
    }

    const { to, body } = req.body;

    twilioClient.messages
        .create({
            from: `whatsapp:${twilioPhoneNumber}`,
            to: `whatsapp:${to}`,
            body: body
        })
        .then((message) => {
            console.log(`[${new Date().toISOString()}] Outbound message sent: ${message.sid}`);
            res.json({ success: true, sid: message.sid });
        })
        .catch((error) => {
            console.error(`[${new Date().toISOString()}] Error sending message:`, error);
            res.status(500).json({ error: error.message });
        });
});

app.listen(port, () => {
    console.log(`[${new Date().toISOString()}] Server is running on port ${port}`);
    console.log(`Webhook URL: http://localhost:${port}/sms`);
});
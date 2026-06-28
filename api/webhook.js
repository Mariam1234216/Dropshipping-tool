
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. Secret verify karna (Agar secret na ho to error na de, sirf console kare)
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  const signature = req.headers['x-signature'];

  if (secret && signature) {
    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
    const sig = Buffer.from(signature, 'utf8');
    
    // Signature match check
    if (!crypto.timingSafeEqual(digest, sig)) {
      return res.status(401).json({ message: 'Invalid signature' });
    }
  }

  // 2. Event handle karna
  const event = req.body.meta.event_name;
  const email = req.body.data.attributes.user_email;

  console.log(`Event received: ${event} for user: ${email}`);

  // YAHAN AAPKA PRO UPGRADE LOGIC AAYEGA
  if (event === 'subscription_created' || event === 'order_created') {
    console.log('Action: Unlock Pro Features for', email);
    // Jab database connect hoga, yahan uska code likhenge
  }

  return res.status(200).json({ message: 'Webhook received' });
};

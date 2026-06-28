
const crypto = require('crypto');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // 1. Secret Key (Yeh wo hai jo aapne LemonSqueezy mein set ki thi)
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET; 

  // 2. Signature Verify karna
  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(JSON.stringify(req.body)).digest('hex'), 'utf8');
  const signature = Buffer.from(req.headers['x-signature'] || '', 'utf8');

  if (!crypto.timingSafeEqual(digest, signature)) {
    return res.status(401).json({ message: 'Invalid signature' });
  }

  // 3. Agar signature match ho jaye, to yahan data process karein
  console.log('Webhook verified:', req.body.meta.event_name);
  
  return res.status(200).json({ message: 'Webhook verified and received' });
};


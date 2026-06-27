module.exports = (req, res) => {
  if (req.method === 'POST') {
    console.log('Webhook received:', req.body);
    res.status(200).json({ message: 'Webhook received successfully' });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

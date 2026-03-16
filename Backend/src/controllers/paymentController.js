const { createCheckoutSession, getSessionDetails } = require('../services/paymentService');

const createCheckout = async (req, res) => {
  try {
    const { productId, email } = req.body;

    if (!productId || !email) {
      return res.status(400).json({ message: 'productId and email are required' });
    }

    const result = await createCheckoutSession(productId, email);
    return res.json(result);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Checkout failed' });
  }
};

const getSessionDetailsHandler = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const details = await getSessionDetails(sessionId);
    return res.json(details);
  } catch (err) {
    return res.status(err.status || 500).json({ message: err.message || 'Session lookup failed' });
  }
};

module.exports = {
  createCheckout,
  getSessionDetailsHandler,
};

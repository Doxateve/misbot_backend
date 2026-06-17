import BotServices from '../services/compras.services.js';

const comprarObjeto = async (req, res) => {
  const username = req.body.username
  const items = req.body.items

  try {
    const response = await BotServices.comprarItem(username, items);
    res.send(response)
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { comprarObjeto };
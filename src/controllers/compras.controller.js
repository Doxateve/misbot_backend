import BotServices from '../services/compras.services.js';

const comprarObjeto = async (req, res) => {
  const username = req.body.username
  const itemName = req.body.itemName
  const cantidad = req.body.cantidad

  try {
    const response = await BotServices.comprarItem(username, itemName, cantidad);
    res.send(response)
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export default { comprarObjeto };
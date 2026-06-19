import comprasServices from '../services/compras.services.js';

const comprarObjeto = async (req, res) => {
  const username = req.body.username;
  const items = req.body.items;

  // Para luego verificar que el array si tenga esos campos
  const itemNames = items.every(item => item.hasOwnProperty('itemName'));
  const cantidades = items.every(item => item.hasOwnProperty('cantidad'));

  // Si la request no contiene alguno de los campos, entonces:
  if(!username || !items || !itemNames || !cantidades) { // itemNames y cantidades son los de de todos los objetos del array items
    // 400 bad request
    return res.status(400).json({ message: "Request invalida (Faltan campos)" });
  }

  try {
    // Intenta comprar
    await comprasServices.comprarItem(username, items);

    // 200 OK
    return res.status(200).json({ message: "Compra realizada satisfactoriamente." });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export default { comprarObjeto };
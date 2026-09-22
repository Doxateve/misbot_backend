import mcItemsServices from "../services/mcItems.services.js"

const listarMcItems = async (req, res) => {
  try {
    const items = await mcItemsServices.mostrarObjetos()
    res.status(200).json({ items })
  } catch (error) {
    res.status(500).json({ message: "Ocurrio un error." })
  }
}

const agregarObjeto = async (req, res) => {
  const mcItem = req.body.mcItem
  const nombre = req.body.nombre
  const descripcion = req.body.descripcion
  const precio = req.body.precio
  const stock = req.body.stock

  try {
    const response = await mcItemsServices.añadirObjeto({ mcItem, nombre, descripcion, precio, stock })
    return res.status(200).json({ response })
  } catch(error) {
    return res.status(500).json({ message: error.message });
  }
}

export default { listarMcItems, agregarObjeto };
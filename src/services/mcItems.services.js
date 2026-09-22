// importa el archivo de los json oficial de los items de minecraft
import minecraftItems from "../assets/minecraft-items.json" with { type: "json" };

import prisma from '../config/database.js';

import botServices from "./bot.services.js";

const mapaIconos = new Map(
  minecraftItems.items.map((item) => [item.itemId, item.imgSrc]),
);

function obtenerIconoPorMcItem(mcItem) {
  return mapaIconos.get(mcItem) ?? null;
}

const mostrarObjetos = () => {
  return minecraftItems.items.map((item) => ({
    nombre: item.displayName,
    mcItem: item.itemId,
    imgSrc: item.imgSrc,
  }));
};

const añadirObjeto = async ({ mcItem, nombre, descripcion, precio, stock }) => {
  const item = minecraftItems.items.find((item) => item.itemId === mcItem);

   if (!item) {
     throw new Error("Ese item no existe!");
   }

  if(!mcItem || !precio || !stock) {
    throw new Error("Faltan datos");
  }

  try {
    await botServices.añadirObjeto({ nombre, mcItem, stock })
    const response = await prisma.producto.create({ data: {
      imagenUrl: item.imgSrc,
      mcItem,
      nombre: !nombre ? item.displayName : nombre,
      descripcion: !descripcion ? "" : descripcion,
      precio,
      stock,
      tipo: "ITEM"
    } })
    return response
  } catch(error) {
    throw new Error(error)
  }
};

export default { obtenerIconoPorMcItem, mostrarObjetos, añadirObjeto };

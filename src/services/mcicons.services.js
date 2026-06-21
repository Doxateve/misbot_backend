// importa el archivo de los json oficial de los items de minecraft
import minecraftItems from '../assets/minecraft-items.json' with { type: 'json' };

const mapaIconos = new Map(
    minecraftItems.items.map((item) => [item.itemId, item.imgSrc])
);

function obtenerIconoPorMcItem(mcItem) {
    return mapaIconos.get(mcItem) ?? null;
}

export default { obtenerIconoPorMcItem };
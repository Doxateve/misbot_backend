import config from '../config/index.js';

import prisma from '../config/database.js';

import mineflayer from 'mineflayer';
import mineflayerPathfinder from 'mineflayer-pathfinder';

import nbt from 'prismarine-nbt';
import { error } from 'node:console';

const { pathfinder, Movements, goals: { GoalBlock } } = mineflayerPathfinder;

// Inicia el bot con la config de ./config/index.js
const bot = mineflayer.createBot(config.bot)

// Carga los plugins
bot.loadPlugin(pathfinder);

// Define los movimientos base
const defaultMove = new Movements(bot)

// Inicia el tiempo de espera en null
let timeoutActualizacion = null;

// Inicia que el bot no esté ocupado
let botOcupado = false; // Para que no intente entregar una cosa mientras está entregando otra

bot.on('error', (e) => {
  console.log('[!] Error a la hora de conectar el bot.')
})

// Funcion para sincromizar el stock
const sincronizarStock = async () => {
  // Busca los items en el inventario
  const botItems = bot.inventory.items();
  // Crea el mapa del stock
  const stockMap = {};

  // Hace lo siguiente con cada item del inventario
  botItems.forEach(item => {
    // Saca el custom name o asignado por un Yunque 
    const nameRaw = item.nbt?.value?.display?.value?.Name?.value;
    // si no hay valor, pues null we
    const parsedName = nameRaw ? JSON.parse(nameRaw).text : null;

    // Verifica si es una shulkerbox
    const esShulker = item.name.includes('shulker_box');

    // Verifica si tiene nombre personalizado
    if (parsedName) {
        
        // Si stockmap (array) no contiene el "parsedName", lo agrega con stock 0
        if (!stockMap[parsedName]) {
          // Si esShulker, su tipo es "KIT", si no, "ITEM"
          stockMap[parsedName] = { stock: 0, mcItem: item.name, tipo: esShulker ? 'KIT' : 'ITEM' };
        }

        // Si es shulker cuenta como 1 kit, si no, cuenta la cantidad del stack
        stockMap[parsedName].stock += esShulker ? 1 : item.count;
    } else {
      // Si no tiene custom name o nombre puesto por Yunque, hace lo mismo con el displayName
        if (!stockMap[item.displayName]) {
          // Si stockmap no tiene contiene "displayName", lo agrega con stock 0
          // Si esShulker, su tipo es "KIT", si no, "ITEM"
          stockMap[item.displayName] = { stock: 0, mcItem: item.name, tipo: esShulker ? 'KIT' : 'ITEM' };
        }
        // Suma al stock la cantidad de veces que se repite el item
        stockMap[item.displayName].stock += item.count;
    }
  });

  try {
    // Busca todos los productos en la base de datos
    const productosEnBD = await prisma.producto.findMany({
      select: { nombre: true, tipo: true, mcItem: true }
    });

    // Añade al stockmap los productos que estan en la base de datos pero no en el inventario
    productosEnBD.forEach(p => {
      // Los agrega si no es un producto de rol y si no existe
      if (!stockMap[p.nombre] && p.tipo !== 'ROL') {
        stockMap[p.nombre] = { stock: 0, tipo: p.tipo, mcItem: p.mcItem }; // los agrega con stock 0 pq no estan xd
      }
    });

    // Hace lo siguiente con cada item del stockmap
    await Promise.all(
      Object.entries(stockMap).map(async ([nombre, { stock, mcItem, tipo }]) => {
        try {
          // Actualiza la base de datos si hay datos existentes, si no, los agrega
          await prisma.producto.upsert({
            where: { nombre },
            update: { stock },
            // Si no existe, lo crea asi:
            create: {
              nombre,
              stock,
              precio: 0,
              descripcion: '',
              mcItem,
              tipo
            }
          });
          
        } catch (e) {
          throw new Error(`[-] Error al actualizar/crear ${nombre}: ${e}`);
        }
      })
    );
    
  } catch (error) {
    throw new Error(error);
  }
};

// Lo que el bot hace al spawnear
bot.once('spawn', async () => {
  console.log(`[*] Bot "${config.bot.username}" conectado al servidor ${config.bot.host}`)
  // Hace que el bot siempre corra y pueda hacer parkour
  defaultMove.sprint = true; 
  defaultMove.allowParkour = true;

  // Spawnea en modo espectador para que nadie lo vea
  bot.chat("/gamemode spectator")

  // Actualiza el stock al spawnear
  try {
    await sincronizarStock();
    console.log("[+] Stock sincronizado con la base de Datos");
  } catch(error) {
    console.error("[!] Error al sincronizar stock" + error)
  }

  // Hace lo siguiente cuando el inventario cambia de alguna forma
  bot.inventory.on('updateSlot', async () => {
    // Si el bot está ocupado, no hace nada
    if (botOcupado) return;
    // Si hay timeout, limpia el timeout
    if (timeoutActualizacion) clearTimeout(timeoutActualizacion);
    // Si no hay timeout, lo usa y hace lo siguiente:
    timeoutActualizacion = setTimeout(async () => {
      // Intenta actualizar el inventario
      try {
        await sincronizarStock();
        console.log("[+] Inventario actualizado y stock sincronizado");
      } catch (error) {
        console.error("Error al sincronizar stock:", error);
      }
    }, 300); // espera 300ms
  });
})

// username, y los items (array, adentro tienen itemName, y quantity) las envia el controlador (la request)
const entregarObjeto = (username, items) => {

  // Para no tener q cambiar dos cosas despues, mensaje de compra
  const mensajeCompra = () => {
    // Hace lo siguiente por cada uno de los items del array (items)
    for(const { itemName, cantidad } of items) {
      bot.chat(`/msg ${username} [!] Acabas de comprar un "${itemName}", iré hacia ti, no te muevas!`)
    };
  };

  // Promise para controlar cuando se resuelve o se rechaza, para que la API no devuelva hasta que no termine
  return new Promise((resolve, reject) => {
    // return reject rechaza la promise, dando un error en el comprasService

    // Si la request no tiene o usuario o items
    if(!username || !items) return reject('Request invalida');

    // Si el username es el del bot
    if (username === bot.username) return reject('No me puedo vender a mi mismo');

    // Si el bot está ocupado
    if(botOcupado) return reject('Bot ocupado');

    // Si el jugador está en el server
    const jugador = bot.players[username];

    // Si el jugador no está en el servidor
    if (!jugador) return reject('No te veo!');

    // El objetivo es la entidad del jugador (Si es que existe)
    const objetivo = jugador.entity;

    // Hace lo siguiente por cada uno de los items pasados
    for(const { itemName, cantidad } of items) {
      // Inicia el array de los items para meterle los del filter
      const itemsInventario = [];
      // Inicia el stock, obvio, no we? :v
      let stock = 0;
      
      // Filtra los items del inventario
      bot.inventory.items().filter(item => {
        // Saca el custom name o asignado por un Yunque 
        const nameRaw = item.nbt?.value?.display?.value?.Name?.value;
        const parsedName = nameRaw ? JSON.parse(nameRaw).text : null;

        // Verifica si es una shulkerbox
        const esShulker = item.name.includes('shulker_box');

        // Si existe, y parsedName es igual al nombre del objeto pasado, sigue:
        if(parsedName && parsedName === itemName) {
          // Mete cada item en el array
          itemsInventario.push(item);

          // Le suma al stock
          if(esShulker) {
            stock += 1;
          } else {
            stock += item.count;
          }
        } else if(item.displayName === itemName) { // Si el display name es igual al nombre del objeto
          itemsInventario.push(item);
          stock += item.count;
        }
      });

       // Verifica si el array está vacio, quiere decir que no hay stock o no existe el item
      if(stock === 0) {
          bot.chat(`No hay stock de ${itemName}`);
          return reject(`No hay stock de ${itemName}`);
      }

      // Si el usuario pide mas cantidad del stock que hay
      if(cantidad > stock) {
          bot.chat(`No hay tanto stock de ${itemName}`);
          return reject(`No hay tanto stock de ${itemName}`);
      }
    };

    // Solo calcula la distancia si hay objetivo
    const distanciaAlJugador = objetivo ? bot.entity.position.distanceTo(objetivo.position) : 999

    // Lo que hace al alcanzar al jugador
    const jugadorAlcanzado = async () => {
        try {
          const objetivoActual = bot.players[username]?.entity;
          if (!objetivoActual?.position) return;

          // Mira al jugador
          await bot.lookAt(objetivoActual.position.offset(0, 1.6, 0));

          // Hace lo siguiente por cada uno de los items del array (items)
          for (const { itemName, cantidad } of items) {
            const itemsInventario = bot.inventory.items().filter(item => {
              // Saca el custom name o asignado por un Yunque 
              const nameRaw = item.nbt?.value?.display?.value?.Name?.value;
              // si no hay valor, pues null we
              const parsedName = nameRaw ? JSON.parse(nameRaw).text : null;

              if(parsedName) return parsedName === itemName;
              return item.displayName === itemName
            });
            // Se equipa el objeto a entregar
            await bot.equip(itemsInventario[0], 'hand');
            // Espera 500ms para que se vea que esta mirando al jugador y para q se equipe el objeto
            await new Promise(resolve => setTimeout(resolve, 500));
            // Tira el objeto al jugador
            await bot.toss(itemsInventario[0].type, null, cantidad);
            await new Promise(resolve => setTimeout(resolve, 500));
            // Vuelve a sincronizar el stock
            await sincronizarStock();
            console.log(`[!] Objeto "${itemName}" entregado a "${username}", stock sincronizado`)
          }

          // Se resuelve la promesa cuando alcanza el jugador
          resolve();
        } catch (e) {
          // nada q hacer
          botOcupado = false;
          console.error('[!] Error en jugadorAlcanzado:', e);
          // se rechaza nada q hacer
          reject(e);
        } finally {
          botOcupado = false;
          bot.chat("/gamemode spectator"); 
          }
      }

    // Como ya tira error si no existe "jugador", si no hay objetivo es pq el jugador está muy lejos
    // Si el jugador esta muy lejos, mejor se hace TP
    if(distanciaAlJugador > 150 || !objetivo) {

      botOcupado = true;

      mensajeCompra()

      bot.chat("/gamemode spectator")
      bot.chat(`/tp ${bot.username} ${username}`);

      // Espera 2000ms (2s) despues del primer tp
      setTimeout(async () => {
        // Ahora si como está cerca, toma la entity del jugador
        const objetivoActualizado = bot.players[username]?.entity;
        if (!objetivoActualizado) return reject('No te puedo encontrar');

        // Lo mismo del otro codigo para estar al frente, solo actualice objetivoActualizado
        const xFrente = objetivoActualizado.position.x - Math.sin(objetivoActualizado.yaw) * 3;
        const zFrente = objetivoActualizado.position.z - Math.cos(objetivoActualizado.yaw) * 3;
        const yFrente = objetivoActualizado.position.y;

        // Se hace tp al frente
        bot.chat(`/tp ${bot.username} ${xFrente} ${yFrente} ${zFrente}`);
        bot.chat("/gamemode creative");

        // Espera 100ms para ejecutar jugadorAlcanzado
        await new Promise(resolve => setTimeout(resolve, 100));
        await jugadorAlcanzado();
      }, 2000) // 2s despues del tp
    } else { // Si está cerquita <150 bloques
      // Formula para que calcule donde es el frente del jugador (nose me la dio chepete)
      const distancia = 3; 
      const xFrente = objetivo.position.x - Math.sin(objetivo.yaw) * distancia;
      const zFrente = objetivo.position.z - Math.cos(objetivo.yaw) * distancia;
      const yFrente = objetivo.position.y;
      
      botOcupado = true; 
      
      mensajeCompra();

      // Selecciona el objetivo como el resultado de la formula de arriba
      bot.pathfinder.setGoal(new GoalBlock(xFrente, yFrente, zFrente));

      // Se pone en creativo para que el usuario lo vea caminando hacia el
      bot.chat("/gamemode creative")

      // Para que no se acumulen los listeners de los eventos
      bot.removeAllListeners('path_update');
      bot.removeAllListeners('goal_reached');

      // Hace lo siguiente cuando actualiza la ruta
      bot.on('path_update', (results) => {
        // Si hay noPath o timeout (no se pudo llegar) lo toma como error
        if (results.status === 'noPath' || results.status === 'timeout') {
          botOcupado = false;
          bot.chat("/gamemode spectator");
          bot.removeAllListeners('goal_reached');
          console.error(`[!] El bot no pudo llegar donde "${username}"`);
          bot.chat(`/msg ${username} [!] No pude llegar a tu ubicación, intenta un espacio abierto`);
          return reject('El bot no pudo llegar a tu objetivo');
        };
      });

      // Ejecuta la funcion jugadorAlcanzado al alcanzar su objetivo
      bot.once('goal_reached', jugadorAlcanzado);
    }
  })
};

export default { bot, entregarObjeto };
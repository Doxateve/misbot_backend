import config from "./src/config/index.js";
import app from "./src/app.js";

app.listen(config.port, () => {
    console.log(`[*] Servidor corriendo en el puerto ${config.port}`)
});
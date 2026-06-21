import authServices from "../services/auth.services.js";

const register = async (req, res) => {
    const nombre = req.body.nombre;
    const username = req.body.username;
    const email = req.body.email;
    const contraseña = req.body.contraseña;

    // Si la request no contiene alguno de los campos, entonces:
    if(!nombre || !username || !email || !contraseña) {
        // 400 bad request
        return res.status(400).json({ message: "Request invalida (Faltan campos)." });
    };

    try {
        await authServices.registerService(nombre, username, email, contraseña);
        // 200 OK
        return res.status(200).json({ message: `Usuario "${nombre}" registrado satisfactoriamente.` })
    } catch(error) {
        return res.status(400).json({ message: error.message });
    };
};

const login = async (req, res) => {
    const email = req.body.email;
    const contraseña = req.body.contraseña;
    const recordarme = req.body.recordarme; 

    // Si la request no contiene alguno de los campos, entonces:
    if(!email || !contraseña) {
        // 400 bad request
        return res.status(400).json({ message: "Request invalida (Faltan campos)." });
    };

    if(req.cookies.token){
        // 200 OK
        return res.status(200).json({ message: "Usuario en sesion." });
    }

    try {
        const { usuario, token } = await authServices.loginService({email, contraseña}, res);

        const unDia = 24 * 60 * 60 * 1000;
        const treintaDias = 30 * 24 * 60 * 60 * 1000;

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: recordarme ? treintaDias : unDia
        });

        // 200 OK
        return res.status(200).json({ message: `Sesion iniciada como: "${usuario.username}"`, usuario });
    } catch(error) {
        return res.status(400).json({ message: error.message });
    }
}

export default { register, login };
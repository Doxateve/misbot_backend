import authServices from "../services/auth.services.js";

const register = async (req, res) => {
    const nombre = req.body.nombre
    const username = req.body.username
    const email = req.body.email
    const contraseña = req.body.contraseña

    try {
        await authServices.registerService(nombre, username, email, contraseña);
        return res.send("Registrado: " + username)
    } catch(error) {
        return res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    const email = req.body.email
    const contraseña = req.body.contraseña

    if(req.cookies.token){
        return res.status(200).json({ message: "Usuario en sesion" });
    }

    try {
        const { usuario, token } = await authServices.loginService({email, contraseña}, res)

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 10 * 24 * 60 * 60 * 1000
        });

        return res.json("Login: " + usuario.username)
    } catch(error) {
        return res.status(400).json({ message: error.message });
    }
}

export default { register, login };
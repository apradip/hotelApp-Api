const SOCKET_SETTINGS = {
    host: process.env.FRONTEND_SERVER_URI,
    port: process.env.SOCKET_PORT,
    secure: false,
    auth: {
      privateKey: process.env.SOCKET_PRIVATE_KEY,
      publicKey: process.env.SOCKET_PUBLIC_KEY
    }
};

module.exports = {SOCKET_SETTINGS};
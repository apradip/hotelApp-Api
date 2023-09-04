const allowedOrigins = [
    process.env.DOMAIN,
    process.env.API_SERVER_IP.concat(":", process.env.API_SERVER_PORT),
    process.env.API_SERVER_IP.concat(":", process.env.SOCKET_PORT),
    process.env.FRONTEND_SERVER_IP.concat(":", process.env.FRONTEND_SERVER_PORT),
    process.env.FRONTEND_SERVER_IP.concat(":", process.env.SOCKET_PORT)
];

module.exports = allowedOrigins;
const allowedOrigins = [
    process.env.FRONTEND_DOMAIN,
    process.env.FRONTEND_SERVER_IP,
    process.env.FRONTEND_SERVER_IP.concat(":", process.env.FRONTEND_SERVER_PORT),
    process.env.FRONTEND_SERVER_IP.concat(":", process.env.SOCKET_PORT),
    process.env.GOOGLE_DOMAIN,
    process.env.GOOGLE_CLOUD_DOMAIN,
    process.env.GOOGLE_DIALOGFLOW_DOMAIN,
    process.env.SHEETDB_API_DOMAIN
];

module.exports = allowedOrigins;
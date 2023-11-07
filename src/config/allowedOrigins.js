const allowedOrigins = [
    process.env.FRONTEND_SERVER_DOMAIN,
    process.env.FRONTEND_SERVER_URI,
    process.env.FRONTEND_SERVER_URI.concat(":", process.env.SOCKET_PORT),
    
    process.env.GOOGLE_DOMAIN,
    process.env.GOOGLE_CLOUD_DOMAIN,
    process.env.GOOGLE_DIALOGFLOW_DOMAIN,
    process.env.SHEETDB_API_DOMAIN
];

module.exports = allowedOrigins;
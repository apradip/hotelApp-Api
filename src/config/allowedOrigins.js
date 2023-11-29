const allowedOrigins = [
    "*",
    process.env.API_SERVER_DOMAIN,
    process.env.API_SERVER_DOMAIN.concat(":", process.env.API_SERVER_HTTPS_PORT),
    process.env.FRONTEND_SERVER_URI,
    process.env.FRONTEND_SERVER_URI.concat(":", process.env.FRONTEND_SERVER_PORT),
    process.env.GOOGLE_DOMAIN,
    process.env.GOOGLE_CLOUD_DOMAIN,
    process.env.GOOGLE_DIALOGFLOW_DOMAIN
];

module.exports = allowedOrigins;
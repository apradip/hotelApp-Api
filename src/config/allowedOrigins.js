const allowedOrigins = [
    'https://www.yoursite.com',
    'http://127.0.0.1:8000',
    'http://localhost:3000',
    process.env.API_SERVER_IP.concat(":", process.env.API_SERVER_PORT),
    process.env.FRONTEND_SERVER_IP.concat(":", process.env.FRONTEND_SERVER_PORT)
];

module.exports = allowedOrigins;
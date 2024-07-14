require('dotenv').config();

const DBConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE,
    host: process.env.DB_HOST
};

module.exports = { DBConfig };

/*

Poner esto en la base de datos para que las provincias sean autoincremental a partir de 95

SELECT pg_get_serial_sequence('public.provinces', 'id');

ALTER SEQUENCE public.provinces_id_seq RESTART WITH 95;

*/

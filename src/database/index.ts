import { createConnection } from "typeorm";
require('dotenv').config();

export async function connect() {
     const conn = createConnection({
        name: 'default',
        type: 'postgres',
        host: process.env.DATABASE_IP,
        port: parseInt(process.env.DATABASE_PORT),
        username: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASS,
        database: process.env.DATABASE_NAME,
        logging: true
      //   entities: ['src/database/models/*.ts']
     });

    return conn;
}


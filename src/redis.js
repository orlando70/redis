import Redis from 'ioredis';
import mysql from 'mysql2';

export default class DataCache {
    constructor() {
        this.redis = new Redis();
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
    }

    async getUserFromDB(id) {
        return new Promise((resolve, reject) => {
            this.connection.query(`SELECT * FROM users WHERE id = ${id}`, function (err, results) {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });
    }

    async getUser(id) {
        // session found in cache, send back to caller;
        let data = JSON.parse(await this.redis.get(`data:${id}`));
        if (!data) {
            // session not found in cache, fetch from the database
            data = await this.getUserFromDB(id);
            this.redis.setex(`data:${id}`, 60 * 60 * 1, JSON.stringify(data));
        }
        return data;
    }
}

import mysql from 'mysql2';
import Redis from 'ioredis';

export default class DataCache {
    constructor() {
        this.redis = new Redis();
        this.connection = mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            port: process.env.DB_PORT || 3306,
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

    async getUserFromCache(id) {
        const data = await this.redis.get(`data:${id}`);
        if (data) {
            return JSON.parse(data);
        }
        return null;
    }

    async storeUserInCache(id, data) {
        this.redis.set(`data:${id}`, JSON.stringify(data));
    }

    async getUser(id) {
        // session found in cache, send back to caller;
        let data = await this.getUserFromCache(id);
        if (!data) {
            // session not found in cache, fetch from the database
            data = await this.getUserFromDB(id);
            await this.storeUserInCache(id, data);
        }
        return data;
    }
}
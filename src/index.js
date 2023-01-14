import express from 'express';
import DataCache from './redis.js';
import env from 'dotenv';

env.config({path: process.env.ENV_FILE_PATH});
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());


// A middleware function to check if the user's session is cached in Redis
async function sessionMiddleware(req, res, next) {
    const dataCache = new DataCache();
    let id = "4";
    try {
        const userData = await dataCache.getUser(id);
        req.session = userData[0];
        next();
    } catch (err) {
        res.status(500).send("Error while trying to retrieve session from cache");
    }
}

// Use the middleware in a route
app.use("/", sessionMiddleware, function (req, res) {
    res.send(req.session.email + " Logged in");
});

app.listen(5000, console.log('Server is running...'))
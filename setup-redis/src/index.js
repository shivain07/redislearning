import express from "express";
import Redis from 'ioredis';
import mongoose from 'mongoose';



const app = express();
app.use(express.json())

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

app.get('/redis', async (req, res) => {

    const reply = await redis.ping();

    res.json({ redis: reply })
})

const BANNER_KEY = "app:banner";

app.post('/banner', async (req, res) => {

    await redis.set(BANNER_KEY, req.body.message || "welcome to our website");

    res.json({ success: true })
})

app.get('/banner', async (req, res) => {

    const banner = await redis.get(BANNER_KEY);


    res.json({banner: banner || "welcome to our website"})
})

app.get('/banner/exists', async (req, res) => {

    const exists = await redis.exists(BANNER_KEY);


    res.json({ exists: Boolean(exists) })
})

app.get('/mongo', async (req, res) => {

    const url = "mongodb://localhost:27017/chai_aur_redis";

    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(url)
    }

    res.json({ mongo: 'connected', database: mongoose.connection.name })

    res.json({ redis: reply })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
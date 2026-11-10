import express from "express";
import Redis from 'ioredis';
import mongoose from 'mongoose';


const app = express();
app.use(express.json())

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');


app.post('/user/:id/json', async (req, res) => {

    await redis.set(`user:${req.params.id}`, JSON.stringify(req.body));

    res.json({ savedAs: 'json' })
})


app.get('/user/:id/json', async (req, res) => {
    const user = await redis.get(`user:${req.params.id}`);

    res.json({ user: user ? JSON.parse(user) : null })
})


app.post('/user/:id/hash', async (req, res) => {

    await redis.hset(`user:${req.params.id}:hash`,req.body);

    res.json({ savedAs: 'hset' })
})

app.get('/user/:id/hash', async (req, res) => {

    const user=await redis.hgetall(`user:${req.params.id}:hash`);

    res.json({ user})
})


// simple email queue logic using redis list
const EMAIL_QUEUE = 'Queue:email';
app.post('/sendEmail', async (req, res) => {

    const { email, subject, body } = req.body;

    // add to queue

    const job = await redis.lpush(EMAIL_QUEUE, JSON.stringify({ email, subject, body }));

    res.json({ queued: true, jobId: job })
})

app.get('/sendEmail', async (req, res) => {
    const emailTosend = await redis.rpop(EMAIL_QUEUE);

    // send email logic

    res.json({ emailTosend: emailTosend ? JSON.parse(emailTosend) : null })
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
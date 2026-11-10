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

function otpKey(phone) {
    return `otp:${phone}`;
}


app.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await redis.set(otpKey(phone), otp, 'EX', 300); // Store OTP with a 5-minute expiration

    res.json({ message: 'OTP sent successfully', otp }); // In a real application, you would send the OTP via SMS
})



app.post('/verify-otp', async (req, res) => {
    const { phone, otp } = req.body;

    const storedOtp = await redis.get(otpKey(phone));

    if (!storedOtp) {
        return res.status(400).json({ message: 'OTP expired or not found' });
    }

    if (storedOtp !== otp) {
        return res.status(400).json({ message: 'Invalid OTP',storedOtp,otp });
    }

    // verify the user as the otp is correct
    await redis.del(otpKey(phone)); // Delete OTP after successful verification

    res.json({ message: 'OTP verified successfully' });
})

app.get('/otp/:phone/ttl', async (req, res) => {
    const { phone } = req.params;
    const ttl = await redis.ttl(otpKey(phone));

    res.json({ phone, ttl });
})

app.listen(3000, () => {
    console.log("Server is running on port 3000")
})
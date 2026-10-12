const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { MongoClient } = require('mongodb');
const app = express();
const PORT = 3000;
const mongoUri = process.env.MONGODB_URI;
const mongoDbName = process.env.MONGODB_DB || 'rice_purity';
let scoreSubmissions;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

function getClientIp(req) {
    return (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '')
        .split(',')[0]
        .trim();
}

async function lookupLocation(ip) {
    const unknownLocation = {
        country: 'unknown',
        region: null,
        city: null,
        timezone: null
    };

    try {
        if (ip && ip !== '::1' && ip !== '::ffff:127.0.0.1') {
            const geoRes = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`);
            if (!geoRes.ok) return unknownLocation;
            const geoData = await geoRes.json();

            return {
                country: geoData.country_name || 'unknown',
                region: geoData.region || null,
                city: geoData.city || null,
                timezone: geoData.timezone || null
            };
        }
    } catch (error) {
        console.log(`[SERVER] Geo lookup failed: ${error.message}`);
    }
    return unknownLocation;
}

app.get('/api/ip', async (req, res) => {
    const ip = getClientIp(req);
    const location = await lookupLocation(ip);

    console.log(`[SERVER] visitor IP: ${ip}`);
    if (location.country !== 'unknown') {
        console.log(`[SERVER] Location: ${location.city || 'unknown city'}, ${location.region || 'unknown region'}, ${location.country}`);
    } else {
        console.log(`[SERVER] Location: unknown`);
    }
    res.json({ ip, location });
});

app.post('/api/score', async (req, res) => {
    const checkedQuestions = Array.isArray(req.body.checked) ? req.body.checked : [];
    const totalQuestions = 100;
    const score = Math.max(0, totalQuestions - checkedQuestions.length);
    const ip = getClientIp(req);
    const location = await lookupLocation(ip);

    try {
        const submission = {
            checkedQuestions,
            totalQuestions,
            score,
            ip,
            location,
            submittedAt: new Date()
        };
        const result = await scoreSubmissions.insertOne(submission);

        res.json({
            checkedQuestions,
            totalQuestions,
            score,
            submissionId: result.insertedId
        });
    } catch (error) {
        console.error(`[SERVER] Could not save score submission: ${error.message}`);
        res.status(503).json({ error: 'Could not save your score. Please try again.' });
    }
});

async function startServer() {
    if (!mongoUri) {
        throw new Error('MONGODB_URI is not set. Add your MongoDB connection string to the environment.');
    }

    const mongoClient = new MongoClient(mongoUri);
    await mongoClient.connect();
    const database = mongoClient.db(mongoDbName);
    scoreSubmissions = database.collection('score_submissions');

    app.listen(PORT, () => {
        console.log(`[SERVER] Connected to MongoDB database "${mongoDbName}".`);
        console.log(`[SERVER] Server is running on port ${PORT}`);
    });
}

startServer().catch((error) => {
    console.error(`[SERVER] Could not start: ${error.message}`);
    process.exit(1);
});

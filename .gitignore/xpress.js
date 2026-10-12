const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/api/ip', async (req, res) => {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();

    let location = {
        country: 'unknown',
        region: null,
        city: null,
        timezone: null
    };

    try {
        if (ip && ip !== '::1' && ip !== '::ffff:127.0.0.1') {
            const geoRes = await fetch(`https://ipapi.co/${ip}/json/`);
            const geoData = await geoRes.json();

            location = {
                country: geoData.country_name || 'unknown',
                region: geoData.region || null,
                city: geoData.city || null,
                timezone: geoData.timezone || null
            };
        }
    } catch (error) {
        console.log(`[SERVER] Geo lookup failed: ${error.message}`);
    }

    console.log(`[SERVER] visitor IP: ${ip}`);
    if (location.country !== 'unknown') {
        console.log(`[SERVER] Location: ${location.city || 'unknown city'}, ${location.region || 'unknown region'}, ${location.country}`);
    } else {
        console.log(`[SERVER] Location: unknown`);
    }
    res.json({ ip, location });
});

app.post('/api/score', (req, res) => {
    const checkedQuestions = Array.isArray(req.body.checked) ? req.body.checked : [];
    const totalQuestions = 100;
    const score = Math.max(0, totalQuestions - checkedQuestions.length);

    console.log(`[SERVER] Checked questions: ${JSON.stringify(checkedQuestions)}`);
    console.log(`[SERVER] Computed score: ${score}`);

    res.json({
        checkedQuestions,
        totalQuestions,
        score
    });
});

app.listen(PORT, () => {
  console.log(`[SERVER] Server is running on port ${PORT}`);
});
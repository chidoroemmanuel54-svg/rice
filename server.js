const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const pagePaths = new Set(['/', '/index.html', '/score.html']);

app.use((req, res, next) => {
    if (req.method === 'GET' && pagePaths.has(req.path)) {
        console.info(`[PAGE VISIT] ${new Date().toISOString()} ${req.path}`);
    }
    next();
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/log-checked-questions', (req, res) => {
    const checkedQuestionIds = req.body?.checkedQuestionIds;
    const validQuestionId = /^q(?:[1-9]|[1-9]\d|100)$/;

    if (
        !Array.isArray(checkedQuestionIds) ||
        checkedQuestionIds.length > 100 ||
        !checkedQuestionIds.every((id) => typeof id === 'string' && validQuestionId.test(id)) ||
        new Set(checkedQuestionIds).size !== checkedQuestionIds.length
    ) {
        return res.status(400).json({ error: 'Invalid checked question IDs.' });
    }

    console.info(
        `[CHECKED QUESTIONS] ${new Date().toISOString()} IDs: ${checkedQuestionIds.join(', ') || '(none)'}`
    );
    res.sendStatus(204);
});

app.get('/api/ip-lookup', async (req, res) => {
    try {
        let clientIp = req.query.ip;

        if (!clientIp) {
            const ipResponse = await fetch('https://api.ipify.org?format=json');
            if (!ipResponse.ok) {
                throw new Error('Failed to fetch IP address');
            }

            const ipData = await ipResponse.json();
            clientIp = ipData.ip;
        }

        if (clientIp === '127.0.0.1' || clientIp === '::1') {
            clientIp = '8.8.8.8';
        }

        const apiUrl = `http://ip-api.com/json/${encodeURIComponent(clientIp)}`;
        const apiResponse = await fetch(apiUrl);

        if (!apiResponse.ok) {
            throw new Error(`IP api responded with: ${apiResponse.status}`);
        }

        const data = await apiResponse.json();
        if (data.status !== 'success') {
            throw new Error(data.message || 'IP lookup failed');
        }

        console.info(
            `[IP LOOKUP] ${new Date().toISOString()} succeeded for ${clientIp}\n` +
            JSON.stringify(data, null, 2)
        );
        res.json({
            success: true,
            ipUsed: clientIp,
            data
        });
    } catch (error) {
        console.error('Error fetching IP data:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch geolocation data'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

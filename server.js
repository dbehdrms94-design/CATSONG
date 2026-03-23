const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from root since we moved them out of /public
app.use(express.static(__dirname));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Inquiry API Route
app.post('/api/inquiry', (req, res) => {
  try {
    const { name, contact, serviceType, message } = req.body;

    console.log('--- New Creative Inquiry ---');
    console.log('Name:', name);
    console.log('Contact:', contact);
    console.log('Service Type:', serviceType);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('----------------------------');

    res.json({
      success: true,
      message: '문의가 성공적으로 접수되었습니다.'
    });

  } catch (error) {
    console.error('Inquiry Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', mode: 'Creative Studio' });
});

// 404 handling
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CatSong AI Creator Portfolio Server is running on http://localhost:${PORT}`);
});

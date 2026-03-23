const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Inquiry API Route
app.post('/api/inquiry', (req, res) => {
  try {
    const { name, contact, serviceType, message } = req.body;

    // Log the inquiry to console (In production, you might send an email or save to DB)
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

// AI Content Generation Preview API
app.post('/api/generate-content', async (req, res) => {
  try {
    const { contentType, prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    console.log(`Generating preview for ${contentType}: "${prompt}"`);

    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real app, you'd call Gemini API here.
    // For now, we return a mock response with a placeholder or simulated result.
    let previewUrl = '';
    let previewType = contentType;

    if (contentType === 'image') {
      previewUrl = `https://via.placeholder.com/800x600/667eea/ffffff?text=AI+Generated+Image+for:+${encodeURIComponent(prompt.substring(0, 20))}...`;
    } else if (contentType === 'video') {
      previewUrl = 'video-placeholder';
    } else {
      previewUrl = 'model-placeholder';
    }

    res.json({
      success: true,
      contentType,
      prompt,
      previewUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Generation Error:', error);
    res.status(500).json({ success: false, error: 'AI generation failed' });
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
  console.log(`🚀 CatSong AI Studio Server is running on http://localhost:${PORT}`);
});

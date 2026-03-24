const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---

// AI Content Generation Route (Simulated or Real)
app.post('/api/generate-content', async (req, res) => {
  try {
    const { contentType, prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, error: 'Prompt is required' });
    }

    console.log(`Generating preview for ${contentType}: "${prompt}"`);

    // Using Gemini to generate a descriptive response for the preview
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(`As an AI creative director, describe a high-end ${contentType} based on this prompt: "${prompt}". Keep it professional and inspiring (max 2 sentences).`);
    const response = await result.response;
    const text = response.text();

    // In a real app with Image/Video generation APIs (like DALL-E or stable diffusion), 
    // you would get an actual URL here. For this demo, we use a placeholder with the AI description.
    let previewUrl = '';
    if (contentType === 'image') {
      previewUrl = `https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=1000`; // Abstract AI-ish image
    } else if (contentType === 'video') {
      previewUrl = 'video-placeholder';
    } else {
      previewUrl = 'model-placeholder';
    }

    res.json({
      success: true,
      contentType,
      prompt,
      description: text,
      previewUrl,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ success: false, error: 'AI generation failed' });
  }
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

// Serve index.html for all other routes (SPA style if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 CatSong AI Creator Portfolio Server is running on http://localhost:${PORT}`);
});

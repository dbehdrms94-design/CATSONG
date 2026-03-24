const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'catsong-secret';
const ADMIN_DATA_FILE = path.join(__dirname, 'data', 'admins.json');
const INQUIRY_DATA_FILE = path.join(__dirname, 'data', 'inquiries.json');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Middleware
app.use(cors());
app.use(express.json());

// Persisting admin and inquiry records in filesystem for demo purposes
async function ensureDataFile(filePath, initialData = '[]') {
  try {
    await fs.access(filePath);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, initialData, 'utf-8');
  }
}

async function loadData(filePath) {
  await ensureDataFile(filePath);
  const raw = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(raw || '[]');
}

async function saveData(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function authenticateAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
}

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// --- API Routes ---

// Admin Registration API
app.post('/api/admin/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'Invalid username or password (min 6 chars)' });
    }

    const admins = await loadData(ADMIN_DATA_FILE);
    const existing = admins.find(a => a.username === username);
    if (existing) {
      return res.status(409).json({ success: false, error: '관리자 아이디가 이미 존재합니다.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const newAdmin = {
      id: Date.now().toString(),
      username,
      passwordHash: hash,
      createdAt: new Date().toISOString()
    };

    admins.push(newAdmin);
    await saveData(ADMIN_DATA_FILE, admins);

    res.json({ success: true, message: '관리자 계정이 생성되었습니다.' });
  } catch (error) {
    console.error('Admin Register Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Admin Login API
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }

    const admins = await loadData(ADMIN_DATA_FILE);
    const admin = admins.find(a => a.username === username);
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      return res.status(401).json({ success: false, error: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: admin.id, username: admin.username }, JWT_SECRET, { expiresIn: '6h' });
    res.json({ success: true, token, username: admin.username });
  } catch (error) {
    console.error('Admin Login Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Admin Dashboard API
app.get('/api/admin/stats', authenticateAdmin, async (req, res) => {
  try {
    const admins = await loadData(ADMIN_DATA_FILE);
    const inquiries = await loadData(INQUIRY_DATA_FILE);
    res.json({
      success: true,
      admin: req.admin.username,
      adminsCount: admins.length,
      inquiriesCount: inquiries.length,
      mode: 'admin'
    });
  } catch (error) {
    console.error('Admin Stats Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Inquiry list for admin
app.get('/api/admin/inquiries', authenticateAdmin, async (req, res) => {
  try {
    const inquiries = await loadData(INQUIRY_DATA_FILE);
    res.json({ success: true, inquiries });
  } catch (error) {
    console.error('Inquiry List Error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

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
app.post('/api/inquiry', async (req, res) => {
  try {
    const { name, contact, serviceType, message } = req.body;

    const inquiryRecord = {
      id: Date.now().toString(),
      name,
      contact,
      serviceType,
      message,
      createdAt: new Date().toISOString()
    };

    const inquiries = await loadData(INQUIRY_DATA_FILE);
    inquiries.push(inquiryRecord);
    await saveData(INQUIRY_DATA_FILE, inquiries);

    console.log('--- New Creative Inquiry ---');
    console.log('Inquiry:', inquiryRecord);
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

const express = require('express');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
require('dotenv').config();

// データベースと API ルーターをインポート
const db = require('./db.cjs');
const apiRouter = require('./api.cjs');

const app = express();

const API_KEY = process.env.VITE_GEMINI_API_KEY || '';

console.log('Server starting...');
console.log('API_KEY set:', !!API_KEY);
console.log('API_KEY length:', API_KEY.length);

// ミドルウェア
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// API ルーターをマウント
app.use('/api', apiRouter);

// Instagram と X のリンクを自動検出するエンドポイント
app.get('/api/extract-social-media', async (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    const response = await axios.get(url, { 
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 5000 
    });
    const $ = cheerio.load(response.data);
    
    let instagram = '';
    let x = '';
    
    $('a').each((i, el) => {
      const href = $(el).attr('href');
      if (href) {
        if (href.includes('instagram.com') && !instagram) {
          instagram = href.includes('http') ? href : `https://${href}`;
        }
        if ((href.includes('twitter.com') || href.includes('x.com')) && !x) {
          x = href.includes('http') ? href : `https://${href}`;
        }
      }
    });
    
    res.json({ instagram, x });
  } catch (error) {
    console.error('Error extracting social media:', error.message);
    res.status(500).json({ error: 'Failed to extract social media links' });
  }
});

// URL からコンテンツを取得するエンドポイント
app.get('/api/fetch-url', async (req, res) => {
  try {
    const url = req.query.url;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    // URL の内容を取得
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    // HTML から テキストコンテンツを抽出
    const $ = cheerio.load(response.data);
    const text = $('body').text().trim();
    
    res.json({ content: text });
  } catch (error) {
    console.error('Error fetching URL:', error.message);
    res.status(500).json({ error: 'Failed to fetch URL content' });
  }
});

// すべてのリクエストに対して、index.html に API キーを注入
app.get('/', (req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist/index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    
    console.log('GET / - Serving index.html with API key injection');
    
    // API キーをグローバル変数として注入
    if (API_KEY) {
      const scriptTag = `<script>
window.__GEMINI_API_KEY__ = "${API_KEY}";
if (typeof window.process === 'undefined') {
  window.process = { env: {} };
}
window.process.env.API_KEY = "${API_KEY}";
console.log('API Key injected successfully');
</script>`;
      
      html = html.replace('</head>', scriptTag + '</head>');
      console.log('✓ Script tag injected');
    }
    
    res.send(html);
  } catch (error) {
    console.error('Error serving index.html:', error);
    res.status(500).send('Error loading page');
  }
});

// 静的ファイルを提供（index.html 以外）
app.use(express.static(path.join(__dirname, 'dist'), {
  setHeaders: (res, path) => {
    // Disable caching for all files
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
}));

// その他のすべてのリクエストに対して index.html を返す（SPA のため）
app.use((req, res) => {
  try {
    const indexPath = path.join(__dirname, 'dist/index.html');
    let html = fs.readFileSync(indexPath, 'utf8');
    
    if (API_KEY) {
      const scriptTag = `<script>
window.__GEMINI_API_KEY__ = "${API_KEY}";
if (typeof window.process === 'undefined') {
  window.process = { env: {} };
}
window.process.env.API_KEY = "${API_KEY}";
console.log('API Key injected successfully');
</script>`;
      
      html = html.replace('</head>', scriptTag + '</head>');
    }
    
    res.send(html);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Error');
  }
});

const PORT = 8000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`ALDEBARAN is running at http://localhost:${PORT}`);
  if (API_KEY) {
    console.log('✓ Gemini API key is configured');
  } else {
    console.log('⚠ Warning: Gemini API key is not set');
  }
  console.log('✓ Database initialized');
});

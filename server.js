// 必要なツールを読み込む
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch@2'); // バージョン2を指定
const cors = require('cors');

const app = express();
const port = 3000;

// ★★★ 変更点 ★★★
// 通信を許可するウェブサイトのリスト
const allowedOrigins = [
  'https://jien-chat-safe.onrender.com', // Renderのフロントエンド
  'https://shorenji.net' // ここにあなたのWordPressサイトのURLを正確に入力してください
];

const corsOptions = {
  origin: function (origin, callback) {
    // 許可リストに含まれているか、(Postmanなどの)オリジン情報がない場合に許可
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};

// 上記の設定でCORSを有効にする
app.use(cors(corsOptions));
app.use(express.json());

// .envファイルから安全にAPIキーを読み込む
const apiKey = process.env.GOOGLE_API_KEY;
const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

// フロントエンドからの通信を受け付ける窓口
app.post('/api/chat', async (req, res) => {
    try {
        const payload = req.body;
        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Google API Error:', errorBody);
            throw new Error(`Google API error: ${response.status}`);
        }
        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'サーバーでエラーが発生しました。' });
    }
});

// サーバーを起動
app.listen(port, () => {
    console.log(`サーバーが http://localhost:${port} で起動しました`);
});
// 必要なツールを読み込む
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
const port = 3000;

// おまじない
app.use(cors());
app.use(express.json());

// .envファイルから安全にAPIキーを読み込む
const apiKey = process.env.GOOGLE_API_KEY;
const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

// フロントエンドからの通信を受け付ける窓口
app.post('/api/chat', async (req, res) => {
    try {
        // フロントエンドから送られてきた会話履歴などを受け取る
        const payload = req.body;

        // サーバーからGoogleのAIへ問い合わせる（APIキーはここで使われる）
        const response = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) // 受け取った情報をそのままGoogleへ
        });
        
        if (!response.ok) {
            const errorBody = await response.json();
            console.error('Google API Error:', errorBody);
            throw new Error(`Google API error: ${response.status}`);
        }

        const data = await response.json();
        
        // AIからの返答をフロントエンドに送り返す
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
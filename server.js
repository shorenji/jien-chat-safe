// 必要なツールを読み込む
require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');

const app = express();
// Renderが指定するPORT、もしくはローカル用の3000番ポートを使用する
const PORT = process.env.PORT || 3000;

// おまじない
app.use(cors());
app.use(express.json());


// リクエスト受付時のログ出力
app.use((req, res, next) => {
    console.log(`[${new Date().toLocaleString('ja-JP')}] リクエストを受け付けました: ${req.method} ${req.url}`);
    next();
});


// フロントエンドからの通信を受け付ける窓口
app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.GOOGLE_API_KEY;
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        const payload = req.body;
        
        // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
        // 【修正箇所】会話履歴（contents）の中から、一番最後の質問を記録するように修正
        if (payload && payload.contents && Array.isArray(payload.contents) && payload.contents.length > 0) {
            const lastMessage = payload.contents[payload.contents.length - 1];
            if (lastMessage.role === 'user' && lastMessage.parts && lastMessage.parts[0] && lastMessage.parts[0].text) {
                console.log('ユーザーからの質問内容:', lastMessage.parts[0].text);
            }
        }
        // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Google API Error Body:', errorBody);
            throw new Error(`Google API error! status: ${response.status}`);
        }

        const data = await response.json();
        res.json(data);

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ error: 'サーバーでエラーが発生しました。' });
    }
});

// UptimeRobotなど、サーバーが起動しているかを確認するためのルート
app.get('/uptime', (req, res) => {
    res.status(200).send('OK');
});


// サーバーを起動
app.listen(PORT, () => {
    console.log(`チャットボットサーバーがポート ${PORT} で起動しました。`);
});


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
// これからサーバーに来るすべての通信は、まずこの場所を通過するようになります。
app.use((req, res, next) => {
    // 現在時刻と、どのURLへのアクセスがあったかを記録します
    console.log(`[${new Date().toLocaleString('ja-JP')}] リクエストを受け付けました: ${req.method} ${req.url}`);
    next(); // この命令で、チャットボット本体の処理へ進みます
});


// フロントエンドからの通信を受け付ける窓口
app.post('/api/chat', async (req, res) => {
    // .envファイルから安全にAPIキーを読み込む
    // ★★★ ここを元の「GOOGLE_API_KEY」に修正しました ★★★
    const apiKey = process.env.GOOGLE_API_KEY;
    const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    try {
        // フロントエンドから送られてきた会話履歴などを受け取る
        const payload = req.body;
        
        // どんな質問が来たかを具体的にログ出力
        // これで、ユーザーがどんな質問をしたか記録できます。
        if (payload && payload.contents && payload.contents[0] && payload.contents[0].parts && payload.contents[0].parts[0].text) {
            console.log('ユーザーからの質問内容:', payload.contents[0].parts[0].text);
        }

        // サーバーからGoogleのAIへ問い合わせる（APIキーはここで使われる）
        const response = await fetch(geminiApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) // 受け取った情報をそのままGoogleへ
        });

        if (!response.ok) {
            const errorBody = await response.text(); // エラー時はテキストで内容を確認
            console.error('Google API Error Body:', errorBody);
            throw new Error(`Google API error! status: ${response.status}`);
        }

        const data = await response.json();

        // AIからの応答をフロントエンドに送り返す
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
    // サーバー起動時のログ出力
    // どのポート番号で起動したか、明確にわかるようにしました。
    console.log(`チャットボットサーバーがポート ${PORT} で起動しました。`);
});


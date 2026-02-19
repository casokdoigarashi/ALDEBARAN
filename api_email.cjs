const express = require('express');
const router = express.Router();
const { authMiddleware } = require('./auth.cjs');

// メールドラフト再生成エンドポイント
router.post('/regenerate-email', authMiddleware, async (req, res) => {
  try {
    const { proposalId, draftType, tone, currentContent } = req.body;

    if (!proposalId || !draftType || !tone || !currentContent) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const API_KEY = process.env.VITE_GEMINI_API_KEY;
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }

    // トーンに応じたプロンプト
    const toneInstructions = {
      more_formal: 'より丁寧でフォーマルな表現に書き直してください。敬語を適切に使用し、ビジネス文書として洗練された文章にしてください。',
      more_casual: 'よりカジュアルで親しみやすい表現に書き直してください。堅苦しさを減らし、読みやすい文章にしてください。',
      shorter: 'より簡潔に要点をまとめて書き直してください。冗長な表現を削除し、必要な情報だけを残してください。',
      longer: 'より詳しく丁寧に説明を加えて書き直してください。背景情報や具体例を追加し、理解しやすい文章にしてください。',
      friendly: 'より親しみやすく温かみのある表現に書き直してください。相手との距離を縮める表現を使用してください。',
      professional: 'よりプロフェッショナルで専門的な表現に書き直してください。業界用語を適切に使用し、信頼感のある文章にしてください。'
    };

    const instruction = toneInstructions[tone] || toneInstructions.more_formal;

    const prompt = `以下のメール文を、指示に従って書き直してください。

【指示】
${instruction}

【元のメール文】
${currentContent}

【書き直したメール文】
メール文のみを出力してください。説明や注釈は不要です。`;

    // Gemini APIを呼び出し
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return res.status(500).json({ error: 'Failed to regenerate email' });
    }

    const data = await response.json();
    const regeneratedContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!regeneratedContent) {
      return res.status(500).json({ error: 'No content generated' });
    }

    res.json({
      success: true,
      content: regeneratedContent.trim()
    });

  } catch (error) {
    console.error('Email regeneration error:', error);
    res.status(500).json({ error: 'Failed to regenerate email' });
  }
});

// メールドラフト保存エンドポイント
router.post('/save-email', authMiddleware, async (req, res) => {
  try {
    const { proposalId, draftType, content } = req.body;

    if (!proposalId || !draftType || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const db = require('./db.cjs');

    // 提案書の存在確認
    const proposal = db.prepare('SELECT id, content FROM proposals WHERE id = ?').get(proposalId);
    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // contentをJSONとしてパース
    let proposalContent;
    try {
      proposalContent = typeof proposal.content === 'string' 
        ? JSON.parse(proposal.content) 
        : proposal.content;
    } catch (e) {
      return res.status(500).json({ error: 'Invalid proposal content format' });
    }

    // emailDraftsが存在しない場合は初期化
    if (!proposalContent.emailDrafts) {
      proposalContent.emailDrafts = {
        standard: '',
        formal: '',
        casual: ''
      };
    }

    // 指定されたdraftTypeの内容を更新
    proposalContent.emailDrafts[draftType] = content;

    // データベースに保存
    db.prepare('UPDATE proposals SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
      .run(JSON.stringify(proposalContent), proposalId);

    res.json({
      success: true,
      message: 'Email draft saved successfully'
    });

  } catch (error) {
    console.error('Email save error:', error);
    res.status(500).json({ error: 'Failed to save email' });
  }
});

module.exports = router;

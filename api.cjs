const express = require('express');
const db = require('./db.cjs');
const { hashPassword, verifyPassword, generateToken, authMiddleware } = require('./auth.cjs');
const router = express.Router();

// ===== ユーザー認証エンドポイント =====

// ユーザー登録
router.post('/auth/register', async (req, res) => {
  try {
    const { email, password, name, department } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    // メールアドレスが既に登録されているか確認
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーを作成
    const result = db.prepare(
      'INSERT INTO users (email, password, name, department) VALUES (?, ?, ?, ?)'
    ).run(email, hashedPassword, name, department || '');

    const token = generateToken(result.lastInsertRowid, email);

    res.json({
      success: true,
      token,
      user: {
        id: result.lastInsertRowid,
        email,
        name,
        department
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// ユーザーログイン
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password: password ? '***' : 'empty' });

    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // ユーザーを検索
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    console.log('User found:', user ? 'yes' : 'no');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // パスワードを検証
    console.log('Verifying password...');
    const isValid = await verifyPassword(password, user.password);
    console.log('Password valid:', isValid);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ===== 提案書エンドポイント =====

// 提案書を保存
router.post('/proposals', authMiddleware, (req, res) => {
  try {
    const { id, clientName, websiteUrl, formData, proposalContent, researchData } = req.body;
    const userId = req.user.userId;

    const proposalId = id || `prop-${Date.now()}`;

    // 既存の提案書を確認
    const existing = db.prepare('SELECT id FROM proposals WHERE id = ?').get(proposalId);

    if (existing) {
      // 更新
      db.prepare(`
        UPDATE proposals 
        SET client_name = ?, website_url = ?, proposal_content = ?, research_data = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND user_id = ?
      `).run(clientName, websiteUrl, JSON.stringify(proposalContent), JSON.stringify(researchData), proposalId, userId);
    } else {
      // 新規作成
      db.prepare(`
        INSERT INTO proposals (id, user_id, client_name, website_url, proposal_content, research_data)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(proposalId, userId, clientName, websiteUrl, JSON.stringify(proposalContent), JSON.stringify(researchData));
    }

    res.json({
      success: true,
      proposalId
    });
  } catch (error) {
    console.error('Save proposal error:', error);
    res.status(500).json({ error: 'Failed to save proposal' });
  }
});

// 提案書一覧を取得
router.get('/proposals', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId;

    const proposals = db.prepare(`
      SELECT id, client_name, website_url, status, created_at, updated_at
      FROM proposals
      WHERE user_id = ?
      ORDER BY updated_at DESC
    `).all(userId);

    res.json({
      success: true,
      proposals
    });
  } catch (error) {
    console.error('Get proposals error:', error);
    res.status(500).json({ error: 'Failed to get proposals' });
  }
});

// 提案書を取得
router.get('/proposals/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const proposal = db.prepare(`
      SELECT * FROM proposals
      WHERE id = ? AND user_id = ?
    `).get(id, userId);

    if (!proposal) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    // JSON フィールドをパース
    proposal.proposal_content = JSON.parse(proposal.proposal_content || '{}');
    proposal.research_data = JSON.parse(proposal.research_data || '{}');

    res.json({
      success: true,
      proposal
    });
  } catch (error) {
    console.error('Get proposal error:', error);
    res.status(500).json({ error: 'Failed to get proposal' });
  }
});

// 提案書を削除
router.delete('/proposals/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    db.prepare('DELETE FROM proposals WHERE id = ? AND user_id = ?').run(id, userId);

    res.json({
      success: true
    });
  } catch (error) {
    console.error('Delete proposal error:', error);
    res.status(500).json({ error: 'Failed to delete proposal' });
  }
});

// ===== レポートエンドポイント =====

// 統計情報を取得
router.get('/reports/stats', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId;

    const stats = {
      totalProposals: db.prepare('SELECT COUNT(*) as count FROM proposals WHERE user_id = ?').get(userId).count,
      draftProposals: db.prepare('SELECT COUNT(*) as count FROM proposals WHERE user_id = ? AND status = ?').get(userId, 'draft').count,
      completedProposals: db.prepare('SELECT COUNT(*) as count FROM proposals WHERE user_id = ? AND status = ?').get(userId, 'completed').count,
      totalMaterials: db.prepare('SELECT COUNT(*) as count FROM materials WHERE user_id = ?').get(userId).count
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

// ===== 原料データベースエンドポイント =====

// 原料を追加
router.post('/materials', authMiddleware, (req, res) => {
  try {
    const { id, tradeName, inciName, manufacturer, description, benefits, category, recommendedConcentration, costLevel, price, origin, country, sustainability, certifications } = req.body;
    const userId = req.user.userId;

    const materialId = id || `mat-${Date.now()}`;

    db.prepare(`
      INSERT INTO materials (id, user_id, trade_name, inci_name, manufacturer, description, benefits, category, recommended_concentration, cost_level, price, origin, country, sustainability, certifications)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      materialId, userId, tradeName, inciName, manufacturer, description, 
      JSON.stringify(benefits), category, recommendedConcentration, costLevel, 
      price, origin, country, sustainability, JSON.stringify(certifications)
    );

    res.json({
      success: true,
      materialId
    });
  } catch (error) {
    console.error('Add material error:', error);
    res.status(500).json({ error: 'Failed to add material' });
  }
});

// 原料一覧を取得
router.get('/materials', authMiddleware, (req, res) => {
  try {
    const userId = req.user.userId;

    const materials = db.prepare(`
      SELECT * FROM materials
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).all(userId);

    // JSON フィールドをパース
    materials.forEach(mat => {
      mat.benefits = JSON.parse(mat.benefits || '[]');
      mat.certifications = JSON.parse(mat.certifications || '[]');
    });

    res.json({
      success: true,
      materials
    });
  } catch (error) {
    console.error('Get materials error:', error);
    res.status(500).json({ error: 'Failed to get materials' });
  }
});

module.exports = router;

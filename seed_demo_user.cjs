const db = require('../db.cjs');
const { hashPassword } = require('../auth.cjs');

async function seedDemoUser() {
  try {
    // デモユーザーが既に存在するか確認
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get('demo@aldebaran.com');
    
    if (existing) {
      console.log('✓ Demo user already exists');
      return;
    }

    // デモユーザーを作成
    const hashedPassword = await hashPassword('demo123');
    const result = db.prepare(
      'INSERT INTO users (email, password, name, department) VALUES (?, ?, ?, ?)'
    ).run('demo@aldebaran.com', hashedPassword, 'デモユーザー', '営業部');

    console.log('✓ Demo user created successfully');
    console.log('  Email: demo@aldebaran.com');
    console.log('  Password: demo123');
  } catch (error) {
    console.error('Error seeding demo user:', error);
  }
}

seedDemoUser();

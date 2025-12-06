const db = require('./db.cjs');
const { verifyPassword } = require('./auth.cjs');

async function testLogin() {
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get('demo@aldebaran.com');
  
  if (!user) {
    console.log('❌ User not found');
    return;
  }
  
  console.log('✓ User found:', {
    id: user.id,
    email: user.email,
    name: user.name,
    passwordHash: user.password.substring(0, 20) + '...'
  });
  
  const isValid = await verifyPassword('demo123', user.password);
  console.log('Password verification:', isValid ? '✓ Valid' : '❌ Invalid');
}

testLogin();

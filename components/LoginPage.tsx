import React, { useState } from 'react';
import Button from './common/Button';
import Input from './common/Input';

interface LoginPageProps {
  onLoginSuccess: (token: string, user: any) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin
        ? { email, password }
        : { email, password, name, department };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || '処理に失敗しました');
        return;
      }

      // トークンと ユーザー情報を保存
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      onLoginSuccess(data.token, data.user);
    } catch (err) {
      setError('通信エラーが発生しました');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* ロゴ */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-serif-jp font-bold text-brand-primary mb-2">
              AI OEM コンシェルジュ
            </h1>
            <p className="text-brand-secondary text-sm">
              {isLogin ? 'ログイン' : '新規登録'}
            </p>
          </div>

          {/* エラーメッセージ */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* フォーム */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-serif-jp font-semibold text-brand-secondary mb-2">
                    お名前
                  </label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例：田中太郎"
                    required={!isLogin}
                  />
                </div>

                <div>
                  <label className="block text-sm font-serif-jp font-semibold text-brand-secondary mb-2">
                    部門（オプション）
                  </label>
                  <Input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="例：営業部"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-serif-jp font-semibold text-brand-secondary mb-2">
                メールアドレス
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-serif-jp font-semibold text-brand-secondary mb-2">
                パスワード
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? '処理中...' : (isLogin ? 'ログイン' : '登録')}
            </Button>
          </form>

          {/* 切り替えリンク */}
          <div className="mt-6 text-center">
            <p className="text-sm text-brand-secondary">
              {isLogin ? 'アカウントをお持ちでないですか？' : 'アカウントをお持ちですか？'}
              {' '}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setName('');
                  setDepartment('');
                }}
                className="text-brand-primary font-semibold hover:underline"
              >
                {isLogin ? '新規登録' : 'ログイン'}
              </button>
            </p>
          </div>

          {/* デモ用ユーザー情報 */}
          {isLogin && (
            <div className="mt-6 p-3 bg-brand-bg rounded text-xs text-brand-secondary">
              <p className="font-semibold mb-1">デモ用ユーザー：</p>
              <p>メール: demo@aldebaran.com</p>
              <p>パスワード: demo123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

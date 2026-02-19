const API_BASE_URL = '';

export const regenerateEmailDraft = async (
  proposalId: string,
  draftType: 'standard' | 'formal' | 'casual',
  tone: string,
  currentContent: string
): Promise<string> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('認証が必要です');
  }

  const response = await fetch(`${API_BASE_URL}/api/email/regenerate-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      proposalId,
      draftType,
      tone,
      currentContent
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'メールの再生成に失敗しました');
  }

  const data = await response.json();
  return data.content;
};

export const saveEmailDraft = async (
  proposalId: string,
  draftType: 'standard' | 'formal' | 'casual',
  content: string
): Promise<void> => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('認証が必要です');
  }

  const response = await fetch(`${API_BASE_URL}/api/email/save-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      proposalId,
      draftType,
      content
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'メールの保存に失敗しました');
  }
};

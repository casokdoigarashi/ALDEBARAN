import React, { useState } from 'react';
import Button from './common/Button';
import Textarea from './common/Textarea';

interface EmailDraftEditorProps {
  title: string;
  initialContent: string;
  draftType: 'standard' | 'formal' | 'casual';
  proposalId: string;
  onRegenerate: (draftType: string, tone: string) => Promise<string>;
  onSave: (draftType: string, content: string) => Promise<void>;
}

const EmailDraftEditor: React.FC<EmailDraftEditorProps> = ({
  title,
  initialContent,
  draftType,
  proposalId,
  onRegenerate,
  onSave,
}) => {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [selectedTone, setSelectedTone] = useState('');

  const toneOptions = [
    { value: 'more_formal', label: 'もっとフォーマルに' },
    { value: 'more_casual', label: 'もっとカジュアルに' },
    { value: 'shorter', label: 'もっと簡潔に' },
    { value: 'longer', label: 'もっと詳しく' },
    { value: 'friendly', label: 'もっと親しみやすく' },
    { value: 'professional', label: 'もっとプロフェッショナルに' },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('コピーに失敗しました:', err);
    }
  };

  const handleRegenerate = async () => {
    if (!selectedTone) {
      alert('トーンを選択してください');
      return;
    }
    
    setIsRegenerating(true);
    try {
      const newContent = await onRegenerate(draftType, selectedTone);
      setContent(newContent);
      setSelectedTone('');
    } catch (error) {
      console.error('再生成に失敗しました:', error);
      alert('再生成に失敗しました。もう一度お試しください。');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(draftType, content);
      setIsEditing(false);
      alert('保存しました！');
    } catch (error) {
      console.error('保存に失敗しました:', error);
      alert('保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 bg-brand-bg rounded border border-brand-accent">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-brand-secondary">{title}</h3>
        <div className="flex gap-2">
          <Button
            onClick={handleCopy}
            variant="outline"
            className="text-xs px-3 py-1"
          >
            {copySuccess ? '✓ コピー完了' : '📋 コピー'}
          </Button>
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
              className="text-xs px-3 py-1"
            >
              ✏️ 編集
            </Button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full"
          />
          <div className="flex gap-2 items-center flex-wrap">
            <select
              value={selectedTone}
              onChange={(e) => setSelectedTone(e.target.value)}
              className="px-3 py-2 border border-brand-accent rounded text-sm bg-white"
            >
              <option value="">トーンを選択...</option>
              {toneOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button
              onClick={handleRegenerate}
              disabled={!selectedTone || isRegenerating}
              variant="outline"
              className="text-xs px-3 py-2"
            >
              {isRegenerating ? '⏳ 再生成中...' : '🔄 再生成'}
            </Button>
            <div className="flex-1"></div>
            <Button
              onClick={() => {
                setContent(initialContent);
                setIsEditing(false);
              }}
              variant="outline"
              className="text-xs px-3 py-2"
            >
              キャンセル
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs px-3 py-2"
            >
              {isSaving ? '💾 保存中...' : '💾 保存'}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-brand-secondary whitespace-pre-wrap">
          {content}
        </p>
      )}
    </div>
  );
};

export default EmailDraftEditor;

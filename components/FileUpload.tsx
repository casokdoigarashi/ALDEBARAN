
import React, { useState, useCallback } from 'react';
import Button from './common/Button';
import Card from './common/Card';
import Input from './common/Input';
import { DocumentTextIcon } from './icons/DocumentTextIcon';

interface FileUploadProps {
  onSubmit: (fileOrUrl: File | string) => void;
  onBack: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onSubmit, onBack }) => {
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setUrl('');
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        if (e.dataTransfer.files[0].type === "application/pdf") {
            setFile(e.dataTransfer.files[0]);
            setUrl('');
        }
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleSubmit = () => {
    if (file) {
      onSubmit(file);
    } else if (url) {
      onSubmit(url);
    }
  };

  return (
    <Card title="ドキュメントから抽出">
      <div 
        className={`border-2 border-dashed rounded-sm p-8 text-center transition-colors duration-200 ${isDragging ? 'border-brand-primary bg-brand-bg' : 'border-gray-300'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          accept=".pdf"
          onChange={handleFileChange}
        />
        <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            <DocumentTextIcon className="w-12 h-12 text-gray-400"/>
            <p className="mt-2 text-sm text-brand-light">
                <span className="font-semibold text-brand-primary">クリックしてアップロード</span>またはPDFファイルをここにドラッグ＆ドロップしてください。
            </p>
            {file && <p className="mt-2 text-sm font-serif-jp font-medium text-brand-secondary">{file.name}</p>}
        </label>
      </div>

      <div className="my-6 flex items-center">
        <div className="flex-grow border-t border-gray-300"></div>
        <span className="flex-shrink mx-4 text-gray-500 font-semibold">または</span>
        <div className="flex-grow border-t border-gray-300"></div>
      </div>

      <div>
        <Input 
          id="url-input"
          label="参考製品や企画書のURLを入力"
          placeholder="https://example.com/product-brief"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setFile(null);
          }}
        />
      </div>

      <div className="mt-8 pt-6 border-t border-brand-accent flex justify-between items-center">
        <Button type="button" variant="outline" onClick={onBack}>
          戻る
        </Button>
        <Button onClick={handleSubmit} disabled={!file && !url}>
          情報を抽出
        </Button>
      </div>
    </Card>
  );
};

export default FileUpload;
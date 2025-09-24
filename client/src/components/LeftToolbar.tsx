import React from 'react';

interface LeftToolbarProps {
  onAddText: () => void;
  onAddTable: () => void;
  onAddImage: () => void;
  onAddBullet: () => void;
  onAddPdf: () => void;
  onToggleLayers: () => void;
}

export const LeftToolbar: React.FC<LeftToolbarProps> = ({
  onAddText,
  onAddTable,
  onAddImage,
  onAddBullet,
  onAddPdf,
  onToggleLayers,
}) => {
  const buttonStyle = "w-full text-sm py-2 px-1 rounded hover:bg-gray-200 focus:outline-none focus:shadow-outline text-gray-700";

  return (
    <div className="flex flex-col items-center space-y-2 p-2 bg-white rounded-lg shadow-lg h-full">
      <button onClick={onAddText} title="テキスト追加" className={buttonStyle}>
        テキスト
      </button>
      <button onClick={onAddBullet} title="箇条書き追加" className={buttonStyle}>
        箇条書き
      </button>
      <button onClick={onAddTable} title="テーブル追加" className={buttonStyle}>
        テーブル
      </button>
      <button onClick={onAddImage} title="画像追加" className={buttonStyle}>
        画像
      </button>
      <button onClick={onAddPdf} title="PDF追加" className={buttonStyle}>
        PDF
      </button>

      <div className="w-full border-t border-gray-300 my-2"></div>

      <button onClick={onToggleLayers} title="レイヤー表示切替" className={buttonStyle}>
        レイヤー
      </button>
    </div>
  );
};

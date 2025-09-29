import React from 'react';
import type { InvoiceData } from '../utils/types';

interface StatePreviewProps {
  data: InvoiceData;
}

export const StatePreview: React.FC<StatePreviewProps> = ({ data }) => {
  return (
    <div className="bg-gray-900 text-white p-4 rounded-lg mt-8">
      <h3 className="text-lg font-bold mb-2">State Preview</h3>
      <pre className="text-xs whitespace-pre-wrap break-all">
        <code>{JSON.stringify(data, null, 2)}</code>
      </pre>
    </div>
  );
};

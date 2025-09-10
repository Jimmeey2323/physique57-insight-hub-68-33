import React from 'react';
import { AdvancedNoteTaker } from './AdvancedNoteTaker';

interface GlobalNoteTakerProps {
  pageId?: string;
}

export const GlobalNoteTaker: React.FC<GlobalNoteTakerProps> = ({ pageId }) => {
  return (
    <AdvancedNoteTaker 
      pageId={pageId || window.location.pathname}
      className="fixed bottom-6 right-6 z-50"
    />
  );
};
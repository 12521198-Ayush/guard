'use client';

import { useEffect } from 'react';
import { IconButton } from '@mui/material';
import { FaMicrophone } from 'react-icons/fa';

type VoiceInputProps = {
  onText: (text: string) => void;
  fieldId: string;
  disabled?: boolean;
};

export default function VoiceInput({ onText, fieldId, disabled }: VoiceInputProps) {
  useEffect(() => {
    // Set up the global handler once
    if (typeof window !== 'undefined') {
      // @ts-ignore
      window.onVoiceInputResult = (text: string) => {
        // @ts-ignore
        const activeField = window.activeVoiceField;
        // @ts-ignore
        if (activeField && window.voiceInputHandlers?.[activeField]) {
          // @ts-ignore
          window.voiceInputHandlers[activeField](text);
        }
      };

      // Set up the handler map
      // @ts-ignore
      window.voiceInputHandlers = window.voiceInputHandlers || {};
      // @ts-ignore
      window.voiceInputHandlers[fieldId] = onText;
    }

    return () => {
      // @ts-ignore
      if (window.voiceInputHandlers) delete window.voiceInputHandlers[fieldId];
    };
  }, [fieldId, onText]);

  const startVoice = () => {
    if (disabled) return;

    // Set active field before starting voice input
    // @ts-ignore
    window.activeVoiceField = fieldId;

    // @ts-ignore
    AndroidInterface?.startVoiceInput?.();
  };

  return (
    <IconButton onClick={startVoice} disabled={disabled} edge="end" size="small">
      <FaMicrophone className="text-purple-600" />
    </IconButton>
  );
}

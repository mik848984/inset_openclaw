import { Tooltip } from '@chakra-ui/react';
import React from 'react';

interface IProps {
  text: string;
  maxLength: number;
  withoutTooltip?: boolean;
}

function TruncateText({ text, maxLength, withoutTooltip }: IProps) {
  const safeText = String(text || '');

  if (safeText.length > maxLength) {
    const truncatedText = safeText.substring(0, maxLength) + '...';

    if (withoutTooltip) {
      return <span>{truncatedText}</span>;
    }

    return (
      <Tooltip
        closeDelay={300}
        textAlign="center"
        label={safeText}
        aria-label={safeText}
      >
        <span>{truncatedText}</span>
      </Tooltip>
    );
  }

  return <span>{safeText}</span>;
}

export default TruncateText;

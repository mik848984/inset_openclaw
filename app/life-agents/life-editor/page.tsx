
'use client';
/*eslint-disable*/

import React from 'react';
import LifeAgentPage from '@/components/life-agents/LifeAgentPage';


export default function Page() {
  return (
    <LifeAgentPage
      agentId="life-editor"
      title="✏️ Редактор жизни"
      description="Перепишет твой текст о себе так, чтобы он звучал яснее, сильнее и увереннее."
      placeholder="Напиши короткий абзац о себе или своей жизни так, как ты обычно это делаешь."
      ctaLabel="Создать"
    />
  );
}


'use client';
/*eslint-disable*/

import React from 'react';
import LifeAgentPage from '@/components/life-agents/LifeAgentPage';


export default function Page() {
  return (
    <LifeAgentPage
      agentId="netflix-writer"
      title="🎬 Netflix-Сценарист"
      description="Создай описание серии сериала о своей жизни: с названием, логлайном и синопсисом."
      placeholder="Опиши себя: чем занимаешься, что любишь, о чём мечтаешь, какие у тебя цели."
      ctaLabel="Создать"
    />
  );
}

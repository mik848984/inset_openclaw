
'use client';
/*eslint-disable*/

import React from 'react';
import LifeAgentPage from '@/components/life-agents/LifeAgentPage';


export default function Page() {
  return (
    <LifeAgentPage
      agentId="oracle"
      title="🔮 Оракул"
      description="Вдохновляющее, но реалистичное видение того, каким ты можешь стать через 5–20 лет."
      placeholder="Опиши, кем ты являешься сейчас: работа, образ жизни, что для тебя важно."
      ctaLabel="Создать"
    />
  );
}

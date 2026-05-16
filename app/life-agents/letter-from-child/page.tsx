
'use client';
/*eslint-disable*/

import React from 'react';
import LifeAgentPage from '@/components/life-agents/LifeAgentPage';


export default function Page() {
  return (
    <LifeAgentPage
      agentId="letter-from-child"
      title="💌 Письмо из детства"
      description="Письмо от твоего детского «я», которое радуется тебе и верит в тебя."
      placeholder="Опиши, кем ты являешься сейчас: работа, семья, интересы, что тебя волнует."
      ctaLabel="Создать"
    />
  );
}

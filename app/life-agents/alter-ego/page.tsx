
'use client';
/*eslint-disable*/

import React from 'react';
import LifeAgentPage from '@/components/life-agents/LifeAgentPage';


export default function Page() {
  return (
    <LifeAgentPage
      agentId="alter-ego"
      title="🎭 Альтер-эго"
      description="Создаёт альтернативную версию тебя из другой вселенной, но логически связанную с твоими чертами."
      placeholder="Напиши 3–4 черты, привычки или интереса, которые тебя описывают."
      ctaLabel="Создать"
    />
  );
}

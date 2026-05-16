
'use client';
/*eslint-disable*/

import React from 'react';
import LifeAgentPage from '@/components/life-agents/LifeAgentPage';


export default function Page() {
  return (
    <LifeAgentPage
      agentId="psychoanalyst"
      title="🧠 Психоаналитик"
      description="Мягкий психологический разбор твоей личности с акцентом на сильные стороны и мотивы."
      placeholder="Напиши, что тебе нравится, чем ты занят, какую последнюю книгу или фильм запомнил, какие чувства часто возвращаются."
      ctaLabel="Создать"
    />
  );
}

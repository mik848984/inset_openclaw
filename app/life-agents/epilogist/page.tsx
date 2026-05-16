
'use client';
/*eslint-disable*/

import React from 'react';
import LifeAgentPage from '@/components/life-agents/LifeAgentPage';


export default function Page() {
  return (
    <LifeAgentPage
      agentId="epilogist"
      title="📘 Эпилогист"
      description="Красивый эпилог текущей главы твоей жизни — про ценности, вклад и внутреннее состояние."
      placeholder="Напиши, что для тебя сейчас главное и что ты проходишь или завершаешь."
      ctaLabel="Создать"
    />
  );
}

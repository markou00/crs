import { Title } from '@mantine/core';
import { Suspense } from 'react';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';

export default function DispatchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Title mb="lg">Planlegging</Title>
      <KanbanBoard />
    </Suspense>
  );
}

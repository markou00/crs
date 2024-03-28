import { Title } from '@mantine/core';
import KanbanBoard from './components/KanbanBoard/KanbanBoard';

export default function DispatchPage() {
  return (
    <>
      <Title mb="lg">Planlegging</Title>
      <KanbanBoard />
    </>
  );
}

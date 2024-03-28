import { useMemo } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { ActionIcon, Box, Flex } from '@mantine/core';
import { CSS } from '@dnd-kit/utilities';
import { Column, Id, Task } from '../types';
import classes from './ColumnContainer.module.css';
import TaskCard from '../TaskCard/TaskCard';

interface Props {
  column: Column;
  tasks: Task[];
  createTask: (columnId: Id) => void;
}

function ColumnContainer(props: Props) {
  const { column, createTask, tasks } = props;

  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

  const tasksIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

  if (isDragging) {
    return (
      <Box
        ref={setNodeRef}
        style={style}
        className={`${classes.container} ${classes.isDragging}`}
      />
    );
  }

  return (
    <Box ref={setNodeRef} style={style} className={classes.container}>
      <Box {...attributes} {...listeners} className={classes.title}>
        <Flex gap="0.5rem">
          <div className={classes.taskNumber}>0</div>
          {column.title}
        </Flex>
        <ActionIcon
          radius="md"
          onClick={() => {
            createTask(column.id);
          }}
        >
          <IconPlus />
        </ActionIcon>
      </Box>

      <Box className={classes.taskContainer}>
        <SortableContext items={tasksIds}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
}

export default ColumnContainer;

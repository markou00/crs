'use client';

import { Flex } from '@mantine/core';
import { useEffect, useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { createPortal } from 'react-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';

import ColumnContainer from './ColumnContainer/ColumnContainer';
import classes from './KanbandBoard.module.css';
import TaskCard from './TaskCard/TaskCard';
import { getCars } from '@/lib/server/actions/car-actions';
import { CarType } from '../../../trucks/types';
import { editJob, getJobs } from '@/lib/server/actions/job-actions';
import { JobDetails } from '../../../jobs/types';

function KanbanBoard() {
  const getCarsQuery = useQuery({
    queryKey: ['cars'],
    queryFn: () => getCars(),
  });

  const getJobsQuery = useQuery({
    queryKey: ['jobs'],
    queryFn: () => getJobs(),
  });

  const [columns, setColumns] = useState<Partial<CarType>[]>([]);
  const [activeColumn, setActiveColumn] = useState<Partial<CarType> | null>(null);

  const [tasks, setTasks] = useState<JobDetails[]>([]);
  const [activeTask, setActiveTask] = useState<JobDetails | null>(null);

  useEffect(() => {
    if (getCarsQuery.data?.cars) {
      setColumns([{ id: 0, regnr: 'Unassigned' }, ...getCarsQuery.data.cars]);
    }

    if (getJobsQuery.data?.jobs) {
      setTasks(getJobsQuery.data.jobs);
    }
  }, [getCarsQuery.data?.cars, getJobsQuery.data?.jobs]);

  const columnsId = useMemo(
    () => columns.map((col) => col.id).filter((id) => id !== undefined) as UniqueIdentifier[],
    [columns]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    })
  );

  function onDragStart(event: DragStartEvent) {
    if (event.active.data.current?.type === 'Column') {
      setActiveColumn(event.active.data.current.column);
    }

    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  }

  const editJobMutation = useMutation({
    mutationFn: async ({ task }: { task: JobDetails }) => {
      const determinedStatus = task.carId && task.carId !== 0 ? 'assigned' : 'unassigned';

      const { modifiedJob, error } = await editJob({
        id: task.id,
        status: determinedStatus,
        carId: task.carId === 0 ? null : task.carId,
      });

      if (error) throw new Error("Couldn't modify the job");

      return modifiedJob;
    },
    retry: false,
    onSuccess: async () => {
      const { data } = await getJobsQuery.refetch();
      if (data?.jobs) {
        setTasks(data.jobs);
      }
    },
    onError: (error: any) => console.log(error.message),
  });

  function onDragEnd(event: DragEndEvent) {
    setActiveColumn(null);
    setActiveTask(null);

    const { active, over } = event;
    if (!over) return;

    const activeColumnId = active.id;
    const overColumnId = over.id;

    editJobMutation.mutate({ task: active.data.current?.job });

    if (activeColumnId === overColumnId) return;

    setColumns((cols) => {
      const activeColumnIndex = cols.findIndex((col) => col.id === activeColumnId);

      const overColumnIndex = cols.findIndex((col) => col.id === overColumnId);

      return arrayMove(columns, activeColumnIndex, overColumnIndex);
    });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    // dropping a task over another task
    const isActiveTask = active.data.current?.type === 'Task';

    //dropping a Task over a column
    const isOverTask = over.data.current?.type === 'Task';

    if (!isActiveTask) return;

    if (isActiveTask && isOverTask) {
      setTasks((ts) => {
        const activeIndex = ts.findIndex((t) => t.id === activeId);
        const overIndex = ts.findIndex((t) => t.id === overId);

        // console.log(tasks[overIndex].carId);
        // console.log(tasks[overIndex].car?.regnr);
        // editJobMutation.mutate({ task: tasks[activeIndex], carId: tasks[overIndex].carId! });
        tasks[activeIndex].carId = tasks[overIndex].carId;

        return arrayMove(ts, activeIndex, overIndex);
      });
    }

    const isOverColumn = over.data.current?.type === 'Column';

    if (isActiveTask && isOverColumn) {
      setTasks((ts) => {
        const activeIndex = ts.findIndex((t) => t.id === activeId);

        // eslint-disable-next-line radix
        tasks[activeIndex].carId = parseInt(overId.toString());
        // console.log(overId);

        return arrayMove(ts, activeIndex, activeIndex);
      });
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <div className={classes.columnWrapper}>
        <Flex gap="sm">
          <Flex gap="md">
            <SortableContext items={columnsId}>
              {columns.map((col) => (
                <ColumnContainer
                  key={col.id}
                  column={col}
                  tasks={tasks.filter(
                    (task) =>
                      task.carId === col.id ||
                      (task.carId === null && task.status !== 'completed' && col.id === 0)
                  )}
                />
              ))}
            </SortableContext>
          </Flex>
        </Flex>
      </div>

      {createPortal(
        <DragOverlay>
          {activeColumn && (
            <ColumnContainer
              column={activeColumn}
              tasks={tasks.filter(
                (task) =>
                  task.carId === activeColumn.id ||
                  (task.carId === null && task.status !== 'completed' && activeColumn.id === 0)
              )}
            />
          )}
          {activeTask && <TaskCard task={activeTask} />}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

export default KanbanBoard;

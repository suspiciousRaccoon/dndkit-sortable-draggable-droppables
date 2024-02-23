import React, { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragOverlay,
  closestCorners,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import DroppableList from "./DroppableList";
import { useImmer } from "use-immer";

const data = {
  board: {
    lists: [
      {
        name: "first list",
        id: "listId1",
        tasks: [
          { id: "listId1 11", name: "1 one" },
          { id: "listId1 12", name: "1 two" },
          { id: "listId1 13", name: "1 three" },
        ],
      },
      {
        name: "second list",
        id: "listId2",
        tasks: [
          { id: "listId2 21", name: "2 one" },
          { id: "listId2 22", name: "2 two" },
          { id: "listId2 23", name: "2 three" },
        ],
      },
      {
        name: "third list",
        id: "listId3",
        tasks: [
          { id: "listId3 31", name: "3 one" },
          { id: "listId3 32", name: "3 two" },
          { id: "listId3 33", name: "3 three" },
        ],
      },
    ],
  },
};

function App() {
  const [mockData, setMockData] = useImmer(data.board);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <div style={{ display: "flex", gap: "30px", margin: "auto" }}>
      <DndContext>
        <SortableContext
          items={mockData.lists}
          strategy={horizontalListSortingStrategy}>
    <DndContext
      sensors={sensors}
            collisionDetection={closestCorners}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}>
        {mockData.lists.map((list, _index) => {
          return <DroppableList id={list.id} key={list.id} list={list} />;
        })}
          </DndContext>
        </SortableContext>
      </DndContext>
        <DragOverlay>
          {activeId ? <div id={activeId}> {activeId} </div> : null}
        </DragOverlay>
      </div>
  );

  function findContainerId(containerId) {
    for (const list of mockData.lists) {
      if (list.tasks.some((task) => task.id === containerId)) {
        return list.id;
      }
      if (list.id == containerId) {
        return containerId;
      }
    }
    return null;
  }

  function handleDragStart(event) {
    setActiveId(event.active.id);
  }

  function handleDragOver(event) {
    // handles dragging over another list, otherwise returns
    const { active, over, draggingRect } = event;
    const { id: activeTaskId } = active;
    const { id: overTaskId } = over;

    const activeListId = findContainerId(activeTaskId);
    const overListId = findContainerId(overTaskId);

    if (!activeListId || !overListId || activeListId === overListId) {
      // console.log(activeListId, overListId);
      // console.log(activeTaskId, overTaskId);
      return;
    }
    setMockData((draft) => {
      // find indexes of lists
      const activeListIndex = draft.lists.findIndex(
        (list) => list.id === activeListId
      );
      const overListIndex = draft.lists.findIndex(
        (list) => list.id === overListId
      );

      // get the lists
      const activeTasks = draft.lists[activeListIndex];
      const overTasks = draft.lists[overListIndex];

      // find indexes of tasks

      const activeTaskIndex = activeTasks.tasks.findIndex(
        (task) => task.id == activeTaskId
      );
      const overTaskIndex = overTasks.tasks.findIndex(
        (task) => task.id == overTaskId
      );
      let newIndex;
      // check if the overListId is the id of a list, meaning the container is empty
      if (draft.lists.some((list) => list.id === overListId)) {
        newIndex = overTasks.tasks.length + 1;
        // newIndex = 0;
      } else {
        const isBelowLastItem =
          over &&
          overTaskIndex === overTasks.tasks.length - 1 &&
          // To see if the draggable is bein dragged below the last container
          draggingRect.offsetTop > over.rect.offsetTop + over.rect.height;

        const modifier = isBelowLastItem ? 1 : 0;

        newIndex =
          overTaskIndex >= 0
            ? overTaskIndex + modifier
            : overTasks.tasks.length + 1;
      }
      draft.lists[overListIndex].tasks.splice(
        newIndex,
        0,
        activeTasks.tasks[activeTaskIndex]
      );
      // THE REMOVING OF THE TASK MUST GO AFTER, OTHERWISE EVERYTHING GOES KABOOM
      draft.lists[activeListIndex].tasks = activeTasks.tasks.filter(
        (task) => task.id !== activeTaskId
      );
    });
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    const { id: activeTaskId } = active;
    const { id: overTaskId } = over;

    const activeListId = findContainerId(activeTaskId);
    const overListId = findContainerId(overTaskId);

    if (!activeListId || !overListId || activeListId !== overListId) {
      return;
    }

    setMockData((draft) => {
      const lists = draft.lists;

      // find indexes of lists
      const activeListIndex = lists.findIndex(
        (list) => list.id === activeListId
      );
      const overListIndex = lists.findIndex((list) => list.id === overListId);

      // get the lists
      const activeTasks = lists[activeListIndex];
      const overTasks = lists[overListIndex];
      // console.log("activeTasks", activeTasks, "\n", "overTasks", overTasks);

      // find indexes of tasks

      const activeTaskIndex = activeTasks.tasks.findIndex(
        (task) => task.id == activeTaskId
      );
      const overTaskIndex = overTasks.tasks.findIndex(
        (task) => task.id == overTaskId
      );
      if (activeTaskIndex !== overTaskIndex) {
        draft.lists[overListIndex].tasks = arrayMove(
          draft.lists[overListIndex].tasks,
          activeTaskIndex,
          overTaskIndex
        );
      }
    });
    setActiveId(null);
  }

  // function handleDragEnd(event) {
  //   const { active, over } = event;

  //   if (active.id !== over.id) {
  //     console.log(`Active: ${active.id} | Over: ${over.id}`);
  //     setMockData((data) => {
  //       const { lists } = data;
  //       const newData = { ...data };

  //       // The id is a composite id. it contains the id of the list the task is from aswell as the id of the task. See: https://docs.dndkit.com/presets/sortable#multiple-containers
  //       const [oldListId, oldTaskId] = active.id.split(" ");
  //       const [newListId, newTaskId] = over.id.split(" ");

  //       const oldListIndex = lists.findIndex((list) => list.id === oldListId);
  //       const newListIndex = lists.findIndex((list) => list.id === newListId);

  //       const oldTaskIndex = lists[oldListIndex].tasks.findIndex(
  //         (task) => task.id === active.id
  //       );
  //       const newTaskIndex = lists[newListIndex].tasks.findIndex(
  //         (task) => task.id === over.id
  //       );

  //       // console.log(oldTaskIndex, newTaskIndex);

  //       // if (condition) {
  //       // }

  //       if (oldListId == newListId) {
  //         const sortedList = arrayMove(
  //           newData.lists[oldListIndex].tasks,
  //           oldTaskIndex,
  //           newTaskIndex
  //         );
  //         newData.lists[oldListIndex].tasks = sortedList;
  //       } else {
  //         const movedTask = newData.lists[oldListIndex].tasks.splice(
  //           oldTaskIndex,
  //           1
  //         )[0];

  //         movedTask.id = `${newListId} ${oldTaskId}`;

  //         newData.lists[newListIndex].tasks.splice(newTaskIndex, 0, movedTask);
  //       }
  //       // console.log("old");
  //       // console.log(data);
  //       // console.log("new");
  //       // console.log(newData);
  //       return newData;
  //     });
  //   }
  // }
}

export default App;

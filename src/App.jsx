import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SortableItem } from "./SortableItem";
import DroppableList from "./DroppableList";

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
  const [mockData, setMockData] = useState(data.board);
  const [activeId, setActiveId] = useState(null);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: "30px", margin: "auto" }}>
        {mockData.board.lists.map((list, _index) => {
          return <DroppableList id={list.id} key={list.id} list={list} />;
        })}
        <DragOverlay>
          {activeId ? <div id={activeId}> {activeId} </div> : null}
        </DragOverlay>
      </div>
    </DndContext>
  );

  function findContainer(taskId) {
    for (const list of data.lists) {
      if (list.tasks.some((task) => task.id === taskId)) {
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
    console.log(event.active.id);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      console.log(`Active: ${active.id} | Over: ${over.id}`);
      setMockData((data) => {
        const { lists } = data;
        const newData = { ...data };

        // The id is a composite id. it contains the id of the list the task is from aswell as the id of the task. See: https://docs.dndkit.com/presets/sortable#multiple-containers
        const [oldListId, oldTaskId] = active.id.split(" ");
        const [newListId, newTaskId] = over.id.split(" ");

        const oldListIndex = lists.findIndex((list) => list.id === oldListId);
        const newListIndex = lists.findIndex((list) => list.id === newListId);

        const oldTaskIndex = lists[oldListIndex].tasks.findIndex(
          (task) => task.id === active.id
        );
        const newTaskIndex = lists[newListIndex].tasks.findIndex(
          (task) => task.id === over.id
        );

        console.log(oldTaskIndex, newTaskIndex);

        // if (condition) {
        // }

        if (oldListId == newListId) {
          const sortedList = arrayMove(
            newData.lists[oldListIndex].tasks,
            oldTaskIndex,
            newTaskIndex
          );
          newData.lists[oldListIndex].tasks = sortedList;
        } else {
          const movedTask = newData.lists[oldListIndex].tasks.splice(
            oldTaskIndex,
            1
          )[0];

          movedTask.id = `${newListId} ${oldTaskId}`;

          newData.lists[newListIndex].tasks.splice(newTaskIndex, 0, movedTask);
        }
        console.log("old");
        console.log(data);
        console.log("new");
        console.log(newData);
        return newData;
      });
    }
  }
}

export default App;

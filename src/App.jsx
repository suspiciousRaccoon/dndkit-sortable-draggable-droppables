import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  MeasuringStrategy,
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
  const [items, setItems] = useState([1, 2, 3]);
  const [mockData, setMockData] = useState(data);
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
      // onDragOver={handleDragEnd}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragEnd={handleDragEnd}>
      <div style={{ display: "flex", gap: "30px", margin: "auto" }}>
        {mockData.board.lists.map((list, index) => {
          return <DroppableList id={list.id} key={list.id} list={list} />;
        })}
      </div>
    </DndContext>
  );

  function handleDragEnd(event) {
    const { active, over } = event;

    if (active.id !== over.id) {
      console.log(`Active: ${active.id} | Over: ${over.id}`);
      setMockData((data) => {
        const { lists } = data.board;
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
            newData.board.lists[oldListIndex].tasks,
            oldTaskIndex,
            newTaskIndex
          );
          newData.board.lists[oldListIndex].tasks = sortedList;
        } else {
          const movedTask = newData.board.lists[oldListIndex].tasks.splice(
            oldTaskIndex,
            1
          )[0];

          movedTask.id = `${newListId} ${oldTaskId}`;

          newData.board.lists[newListIndex].tasks.splice(
            newTaskIndex,
            0,
            movedTask
          );
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

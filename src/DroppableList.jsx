import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React from "react";
import SortableItem from "./SortableItem";

const DroppableList = (props) => {
  const { id, list } = props;
  const { isOver, setNodeRef } = useDroppable({ id });

  const style = {
    color: isOver ? "green" : undefined,
    background: "#585858",
    padding: 10,
    margin: 10,
    flex: 1,
  };
  return (
    <div>
      <h1>{list.name}</h1>
      <SortableContext
        id={id}
        items={list.tasks}
        strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} style={style}>
          {list.tasks.map((task, _index) => {
            const { id: taskId, name: taskName } = task;
            return (
              <SortableItem
                key={taskId}
                id={taskId}
                children={<div>task name: {taskName}</div>}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
};

export default DroppableList;

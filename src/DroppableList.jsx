import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React from "react";
import SortableItem from "./SortableItem";

const DroppableList = (props) => {
  const list = props.list;
  const { isOver, setNodeRef } = useDroppable({ id: props.id });

  const style = {
    background: "#dadada",
    padding: 10,
    margin: 10,
    flex: 1,
  };
  return (
    <div>
      <h1>{list.name}</h1>
      <SortableContext
        items={list.tasks}
        strategy={verticalListSortingStrategy}>
        {list.tasks.map((task, index) => {
          const { id, name } = task;
          return (
            <SortableItem
              key={id}
              id={id}
              children={<div>task name: {name}</div>}
            />
          );
        })}
      </SortableContext>
      <div ref={setNodeRef} style={style}>
        {props.children}
      </div>
    </div>
  );
};

export default DroppableList;

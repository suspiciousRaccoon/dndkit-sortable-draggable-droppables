import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import React from "react";
import SortableItem from "./SortableItem";
import { CSS } from "@dnd-kit/utilities";

const DroppableList = (props) => {
  const { id, list } = props;
  const { isOver, setNodeRef: setNodeRefDroppable } = useDroppable({ id });

  const {
    attributes,
    listeners,
    setNodeRef: setNodeRefSortable,
    transform,
    transition,
  } = useSortable({ id: props.id });

  const style = {
    color: isOver ? "green" : undefined,
    background: "#585858",
    padding: 10,
    margin: 10,
    flex: 1,
    minHeight: "50px",
    minWidth: "50px",
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <div
      key={id}
      id={id}
      ref={setNodeRefSortable}
      {...attributes}
      {...listeners}>
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

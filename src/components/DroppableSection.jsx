import React from 'react';
import { useDroppable } from '@dnd-kit/core';

export default function DroppableSection({ id, children, className = '' }) {
    const { isOver, setNodeRef } = useDroppable({
        id: id
    });

    return (
        <div
            ref={setNodeRef}
            className={`droppable-section ${className} ${isOver ? 'droppable-section-over' : ''}`}
        >
            {children}
        </div>
    );
}

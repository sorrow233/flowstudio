import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

export default function DraggableCard({ id, children, disabled = false }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        isDragging
    } = useDraggable({
        id: id,
        disabled: disabled
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        cursor: disabled ? 'default' : 'grab',
        touchAction: 'none'
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`draggable-card ${isDragging ? 'draggable-card-dragging' : ''}`}
            {...listeners}
            {...attributes}
        >
            {children}
        </div>
    );
}

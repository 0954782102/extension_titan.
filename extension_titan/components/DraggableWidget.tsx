
import React, { useState, useEffect, useRef } from 'react';
import { Position } from '../types';

interface DraggableWidgetProps {
  id: string;
  initialPosition: Position;
  onPositionChange: (id: string, pos: Position) => void;
  children: React.ReactNode;
  className?: string;
}

const DraggableWidget: React.FC<DraggableWidgetProps> = ({
  id,
  initialPosition,
  onPositionChange,
  children,
  className = ""
}) => {
  const [pos, setPos] = useState<Position>(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setPos(initialPosition);
  }, [initialPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Don't drag if clicking inside an input or textarea
    if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA' || (e.target as HTMLElement).tagName === 'BUTTON') {
      return;
    }

    setIsDragging(true);
    offset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = e.clientX - offset.current.x;
      const newY = e.clientY - offset.current.y;
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onPositionChange(id, pos);
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, pos, id, onPositionChange]);

  return (
    <div
      ref={widgetRef}
      style={{
        position: 'absolute',
        left: pos.x,
        top: pos.y,
        transition: isDragging ? 'none' : 'all 0.1s ease-out',
      }}
      onMouseDown={handleMouseDown}
      className={`select-none ${isDragging ? 'draggable-active' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default DraggableWidget;

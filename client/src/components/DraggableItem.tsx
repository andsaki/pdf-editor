import React, { useState } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import type { LayoutItem } from "../utils/types";

interface DraggableItemProps {
  item: LayoutItem;
  displayScale: number;
  isSelected: boolean;
  isMultiSelected?: boolean;
  onSelect: () => void;
  onClick?: (itemId: string, event: React.MouseEvent) => void;
  onResize: (width: number, height: number) => void;
  onUpdatePosition: (x: number, y: number) => void;
  onRotate: (rotation: number) => void;
  onUpdate: (updates: Partial<LayoutItem>) => void;
  children: React.ReactNode;
}

export const DraggableItem: React.FC<DraggableItemProps> = ({
  item,
  displayScale,
  isSelected,
  isMultiSelected = false,
  onSelect,
  onClick,
  onResize,
  onRotate,
  onUpdate,
  children,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: item.id,
      disabled: item.locked,
      data: {
        item,
      },
    });

  const [, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });

  const rotation = item.rotation || 0;

  const style = {
    position: "absolute" as const,
    left: item.x * displayScale,
    top: item.y * displayScale,
    width: item.width * displayScale,
    height: item.height * displayScale,
    transform: `${CSS.Translate.toString(transform)} rotate(${rotation}deg)`,
    zIndex: item.zIndex,
    border: isMultiSelected
      ? "2px solid #00cc66"
      : isSelected
      ? "1px solid blue"
      : "1px dashed transparent",
    outline: isMultiSelected
      ? "2px solid #00cc66"
      : isSelected
      ? "2px solid #0066ff"
      : "none",
    outlineOffset: "2px",
    cursor: item.locked ? "default" : isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isMultiSelected ? "rgba(0, 204, 102, 0.1)" : "transparent",
  };

  const handleResizeStart = (
    e: React.MouseEvent,
    direction: "se" | "ne" | "sw" | "nw" | "e" | "w" | "n" | "s"
  ) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: item.width * displayScale,
      height: item.height * displayScale,
    });

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - resizeStart.x;
      const deltaY = moveEvent.clientY - resizeStart.y;

      let newWidth = resizeStart.width;
      let newHeight = resizeStart.height;

      if (direction.includes("e")) newWidth = resizeStart.width + deltaX;
      if (direction.includes("w")) newWidth = resizeStart.width - deltaX;
      if (direction.includes("s")) newHeight = resizeStart.height + deltaY;
      if (direction.includes("n")) newHeight = resizeStart.height - deltaY;

      onResize(
        Math.max(20, newWidth) / displayScale,
        Math.max(20, newHeight) / displayScale
      );
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleRotateStart = (e: React.MouseEvent) => {
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - centerX;
      const deltaY = moveEvent.clientY - centerY;
      const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
      onRotate(angle);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const resizeHandleStyle = {
    position: "absolute" as const,
    width: "10px",
    height: "10px",
    backgroundColor: "#0066ff",
    border: "1px solid white",
    borderRadius: "2px",
    display: isSelected && !item.locked ? "block" : "none",
  };

  const rotateHandleStyle = {
    position: "absolute" as const,
    width: "16px",
    height: "16px",
    backgroundColor: "#00cc66",
    border: "2px solid white",
    borderRadius: "50%",
    display: isSelected && !item.locked ? "block" : "none",
    cursor: "grab",
    top: "-30px",
    left: "50%",
    transform: "translateX(-50%)",
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (item.locked) return;

    const { key, ctrlKey, metaKey, shiftKey, altKey } = e;
    const isResizeMode = ctrlKey || metaKey;
    const step = shiftKey ? 1 : 10;

    // Alt + 矢印キーで回転
    if (altKey) {
      switch (key) {
        case "ArrowLeft":
          e.preventDefault();
          onRotate((rotation - 15 + 360) % 360);
          break;
        case "ArrowRight":
          e.preventDefault();
          onRotate((rotation + 15) % 360);
          break;
      }
      return;
    }

    // Ctrl/Cmd + 矢印キーでリサイズ
    if (isResizeMode) {
      switch (key) {
        case "ArrowUp":
          e.preventDefault();
          onUpdate({ height: Math.max(20, item.height - step) });
          break;
        case "ArrowDown":
          e.preventDefault();
          onUpdate({ height: item.height + step });
          break;
        case "ArrowLeft":
          e.preventDefault();
          onUpdate({ width: Math.max(20, item.width - step) });
          break;
        case "ArrowRight":
          e.preventDefault();
          onUpdate({ width: item.width + step });
          break;
      }
      return;
    }

    // 矢印キーで移動
    switch (key) {
      case "ArrowUp":
        e.preventDefault();
        onUpdate({ y: item.y - step });
        break;
      case "ArrowDown":
        e.preventDefault();
        onUpdate({ y: item.y + step });
        break;
      case "ArrowLeft":
        e.preventDefault();
        onUpdate({ x: item.x - step });
        break;
      case "ArrowRight":
        e.preventDefault();
        onUpdate({ x: item.x + step });
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onSelect();
        break;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        e.stopPropagation();
        if (!item.locked) {
          if (onClick) {
            onClick(item.id, e);
          } else {
            onSelect();
          }
        }
      }}
      onKeyDown={handleKeyDown}
      tabIndex={item.locked ? -1 : 0}
      role="application"
      aria-label={`回転角度: ${Math.round(rotation)}度 ${isMultiSelected ? '(複数選択中)' : ''}`}
    >
      {children}

      {/* Rotate handle */}
      {!item.locked && isSelected && (
        <>
          <div
            style={rotateHandleStyle}
            onMouseDown={handleRotateStart}
            title="回転"
          />
          {/* Rotation line */}
          <div
            style={{
              position: "absolute",
              top: "-30px",
              left: "50%",
              width: "2px",
              height: "20px",
              backgroundColor: "#00cc66",
              transform: "translateX(-50%)",
              display: isSelected && !item.locked ? "block" : "none",
            }}
          />
        </>
      )}

      {/* Resize handles */}
      {!item.locked && isSelected && (
        <>
          {/* Top-left */}
          <div
            style={{ ...resizeHandleStyle, top: -5, left: -5, cursor: "nw-resize" }}
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          {/* Top-right */}
          <div
            style={{ ...resizeHandleStyle, top: -5, right: -5, cursor: "ne-resize" }}
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          {/* Bottom-left */}
          <div
            style={{ ...resizeHandleStyle, bottom: -5, left: -5, cursor: "sw-resize" }}
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          {/* Bottom-right */}
          <div
            style={{ ...resizeHandleStyle, bottom: -5, right: -5, cursor: "se-resize" }}
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          {/* Top */}
          <div
            style={{ ...resizeHandleStyle, top: -5, left: "50%", transform: "translateX(-50%)", cursor: "n-resize" }}
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          {/* Bottom */}
          <div
            style={{ ...resizeHandleStyle, bottom: -5, left: "50%", transform: "translateX(-50%)", cursor: "s-resize" }}
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          {/* Left */}
          <div
            style={{ ...resizeHandleStyle, top: "50%", left: -5, transform: "translateY(-50%)", cursor: "w-resize" }}
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
          {/* Right */}
          <div
            style={{ ...resizeHandleStyle, top: "50%", right: -5, transform: "translateY(-50%)", cursor: "e-resize" }}
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
        </>
      )}
    </div>
  );
};

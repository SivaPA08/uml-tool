import React from 'react';

export default function Line({ selected, style, onMouseDown }) {
  const outer = {
    position: 'absolute',
    width:    60,
    height:   60,
    cursor:   'grab',
    ...style,
    outline: selected ? '3px dashed orange' : 'none'
  };

  return (
    <div style={outer} onMouseDown={onMouseDown}>
      <svg width="60" height="60">
        <line
          x1="0"
          y1="60"
          x2="60"
          y2="0"
          stroke="purple"
          strokeWidth="4"
        />
      </svg>
    </div>
  );
}

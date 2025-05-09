import React from 'react';

export default function Rectangle({ selected, style, onMouseDown }) {
  const outer = {
    position: 'absolute',
    width:    60,
    height:   40,
    cursor:   'grab',
    ...style,
    outline: selected ? '3px dashed orange' : 'none'
  };

  return (
    <div style={outer} onMouseDown={onMouseDown}>
      <svg width="60" height="40">
        <rect
          x="0"
          y="0"
          width="60"
          height="40"
          fill="lightgreen"
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

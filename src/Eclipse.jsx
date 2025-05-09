import React from 'react';

export default function Eclipse({ selected, style, onMouseDown }) {
  // base + selected outline
  const outer = {
    position: 'absolute',
    width:    50,
    height:   50,
    cursor:   'grab',
    ...style,
    outline: selected ? '3px dashed orange' : 'none'
  };

  return (
    <div style={outer} onMouseDown={onMouseDown}>
      <svg width="50" height="50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="lightblue"
          stroke="black"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

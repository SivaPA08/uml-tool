import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

let nextId = 1;
export default function App() {
  const [items, setItems] = useState([]);
  const boardRef = useRef(null);
  const dragging = useRef(null);

  // Add new draggable item
  function fun() {
    const board = boardRef.current;
    if (!board) return;
    // Default at center
    const rect = board.getBoundingClientRect();
    const size = 50;
    const x = rect.width / 2 - size / 2;
    const y = rect.height / 2 - size / 2;
    setItems(prev => [...prev, { id: nextId++, x, y, selected: false }]);
  }

  // Handle delete key
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Delete') {
        setItems(prev => prev.filter(item => !item.selected));
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Mouse move/up for dragging
  useEffect(() => {
    function onMouseMove(e) {
      if (!dragging.current) return;
      const { id, offsetX, offsetY } = dragging.current;
      const board = boardRef.current;
      const rect = board.getBoundingClientRect();
      let x = e.clientX - rect.left - offsetX;
      let y = e.clientY - rect.top - offsetY;
      // Constrain within
      x = Math.max(0, Math.min(rect.width - 50, x));
      y = Math.max(0, Math.min(rect.height - 50, y));
      setItems(prev => prev.map(item => item.id === id ? { ...item, x, y } : item));
    }
    function onMouseUp() {
      dragging.current = null;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  function startDrag(e, item) {
    e.stopPropagation();
    const board = boardRef.current.getBoundingClientRect();
    const offsetX = e.clientX - board.left - item.x;
    const offsetY = e.clientY - board.top - item.y;
    dragging.current = { id: item.id, offsetX, offsetY };
  }

  function selectItem(e, id) {
    e.stopPropagation();
    setItems(prev => prev.map(item => {
      if (item.id === id) return { ...item, selected: !item.selected };
      return item;
    }));
  }

  // Deselect on board click
  function onBoardClick() {
    setItems(prev => prev.map(item => ({ ...item, selected: false })));
  }

  return (
    <div className="main">
      <div className="header"></div>
      <div className="sidebar">
        <button onClick={fun}>Add</button>
      </div>
      <div className="board" ref={boardRef} onClick={onBoardClick}>
        {items.map(item => (
          <div
            key={item.id}
            className={`draggable ${item.selected ? 'selected' : ''}`}
            style={{ left: item.x, top: item.y, width: 50, height: 50 }}
            onMouseDown={e => startDrag(e, item)}
            onClick={e => selectItem(e, item.id)}
          />
        ))}
      </div>
      <div className="footer"></div>
    </div>
  );
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

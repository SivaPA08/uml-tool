import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

let nextId = 1;
export default function App() {
  const [items, setItems] = useState([]);
  const boardRef = useRef(null);
  const dragging = useRef(null);

  // Marquee selection state
  const [selecting, setSelecting] = useState(false);
  const [marquee, setMarquee] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const marqueeStart = useRef({ x: 0, y: 0 });

  // Add new draggable item
  function fun() {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const size = 50;
    const x = rect.width / 2 - size / 2;
    const y = rect.height / 2 - size / 2;
    setItems(prev => [...prev, { id: nextId++, x, y, selected: false }]);
  }

  // Delete key
  useEffect(() => {
    const onKeyDown = e => {
      if (e.key === 'Delete') {
        setItems(prev => prev.filter(item => !item.selected));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Drag and marquee handlers
  useEffect(() => {
    function onMouseMove(e) {
      if (dragging.current) {
        const { id, offsetX, offsetY } = dragging.current;
        const boardRect = boardRef.current.getBoundingClientRect();
        let x = e.clientX - boardRect.left - offsetX;
        let y = e.clientY - boardRect.top - offsetY;
        x = Math.max(0, Math.min(boardRect.width - 50, x));
        y = Math.max(0, Math.min(boardRect.height - 50, y));
        setItems(prev => prev.map(item => item.id === id ? { ...item, x, y } : item));
      } else if (selecting) {
        const boardRect = boardRef.current.getBoundingClientRect();
        const curX = e.clientX - boardRect.left;
        const curY = e.clientY - boardRect.top;
        const start = marqueeStart.current;
        setMarquee({
          x: Math.min(start.x, curX),
          y: Math.min(start.y, curY),
          width: Math.abs(curX - start.x),
          height: Math.abs(curY - start.y),
        });
      }
    }

    function onMouseUp() {
      if (selecting) {
        setItems(prev => prev.map(item => {
          const overlap = !(
            item.x > marquee.x + marquee.width ||
            item.x + 50 < marquee.x ||
            item.y > marquee.y + marquee.height ||
            item.y + 50 < marquee.y
          );
          return { ...item, selected: overlap };
        }));
        setSelecting(false);
        setMarquee({ x: 0, y: 0, width: 0, height: 0 });
      }
      dragging.current = null;
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [selecting, marquee]);

  function startDrag(e, item) {
    e.stopPropagation();
    const boardRect = boardRef.current.getBoundingClientRect();
    dragging.current = {
      id: item.id,
      offsetX: e.clientX - boardRect.left - item.x,
      offsetY: e.clientY - boardRect.top - item.y,
    };
  }

  function onBoardMouseDown(e) {
    if (e.target === boardRef.current) {
      const boardRect = boardRef.current.getBoundingClientRect();
      const x = e.clientX - boardRect.left;
      const y = e.clientY - boardRect.top;
      marqueeStart.current = { x, y };
      setMarquee({ x, y, width: 0, height: 0 });
      setSelecting(true);
      // Deselect all before new marquee
      setItems(prev => prev.map(item => ({ ...item, selected: false })));
    }
  }

  return (
    <div className="main">
      <div className="header"></div>
      <div className="sidebar">
        <button onClick={fun}>Add</button>
      </div>
      <div className="board" ref={boardRef} onMouseDown={onBoardMouseDown}>
        {items.map(item => (
          <div
            key={item.id}
            className={`draggable ${item.selected ? 'selected' : ''}`}
            style={{ left: item.x, top: item.y }}
            onMouseDown={e => startDrag(e, item)}
          />
        ))}
        {selecting && (
          <div
            className="marquee"
            style={{
              left: marquee.x,
              top: marquee.y,
              width: marquee.width,
              height: marquee.height
            }}
          />
        )}
      </div>
      <div className="footer"></div>
    </div>
  );
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

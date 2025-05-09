// App.jsx
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import html2canvas from 'html2canvas';

import Eclipse   from './Eclipse';
import Rectangle from './Rectangle';
import Line      from './Line';

let nextId = 1;

const styles = {
  main: {
    display: 'grid',
    gridTemplateColumns: '250px calc(100% - 250px)',
    gridTemplateRows: '40px calc(100% - 50px) 10px',
    gridTemplateAreas: `
      "header header"
      "sidebar content"
      "footer footer"
    `,
    height: '100vh',
    width: '100vw',
  },
  header: {
    gridArea: 'header',
    backgroundColor: '#129e2b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    color: 'white',
  },
  sidebar: {
    gridArea: 'sidebar',
    backgroundColor: '#343a40',
    color: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  board: {
    gridArea: 'content',
    backgroundColor: '#e9ecef',
    position: 'relative',
    overflow: 'hidden',
  },
  footer: {
    gridArea: 'footer',
    backgroundColor: '#15589b',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
  },
  marquee: {
    position: 'absolute',
    border: '2px dashed #333',
    backgroundColor: 'rgba(0,0,0,0.1)',
    pointerEvents: 'none',
  },
};

export default function App() {
  const [items, setItems]   = useState([]);
  const [past,   setPast]   = useState([]);
  const [future, setFuture] = useState([]);

  const boardRef   = useRef(null);
  const dragging   = useRef(null);
  const marqueeStart = useRef({ x: 0, y: 0 });

  const [selecting, setSelecting] = useState(false);
  const [marquee, setMarquee]     = useState({ x: 0, y: 0, width: 0, height: 0 });

  // History helpers
  function pushHistory() {
    setPast(p => [...p, items]);
    setFuture([]);
  }
  function updateItems(fnOrArray) {
    pushHistory();
    setItems(prev =>
      typeof fnOrArray === 'function' ? fnOrArray(prev) : fnOrArray
    );
  }

  // Add a new shape
  function addShape(ShapeComponent = Eclipse) {
    if (!boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const size = 50;
    const x = rect.width  / 2 - size / 2;
    const y = rect.height / 2 - size / 2;
    updateItems(prev => [
      ...prev,
      { id: nextId++, x, y, selected: false, Shape: ShapeComponent }
    ]);
  }

  // Delete key handler
  useEffect(() => {
    const onKey = e => {
      if (e.key === 'Delete') {
        updateItems(prev => prev.filter(it => !it.selected));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Clear all shapes
  function clearAll() {
    updateItems([]);
  }

  // Undo / Redo
  function undo() {
    if (!past.length) return;
    const previous = past[past.length - 1];
    setFuture(f => [items, ...f]);
    setPast(p => p.slice(0, -1));
    setItems(previous);
  }
  function redo() {
    if (!future.length) return;
    const next = future[0];
    setPast(p => [...p, items]);
    setFuture(f => f.slice(1));
    setItems(next);
  }

  // Save board as image
  function saveImage() {
    if (!boardRef.current) return;
    html2canvas(boardRef.current).then(canvas => {
      const link = document.createElement('a');
      link.download = 'board.png';
      link.href = canvas.toDataURL();
      link.click();
    });
  }

  // Drag and marquee logic
  useEffect(() => {
    function onMouseMove(e) {
      if (dragging.current) {
        const { id, offsetX, offsetY } = dragging.current;
        const br = boardRef.current.getBoundingClientRect();
        let x = e.clientX - br.left - offsetX;
        let y = e.clientY - br.top  - offsetY;
        x = Math.max(0, Math.min(br.width - 50, x));
        y = Math.max(0, Math.min(br.height - 50, y));
        setItems(prev => prev.map(it => it.id === id ? { ...it, x, y } : it));
      } else if (selecting) {
        const br = boardRef.current.getBoundingClientRect();
        const curX = e.clientX - br.left;
        const curY = e.clientY - br.top;
        const start = marqueeStart.current;
        setMarquee({
          x: Math.min(start.x, curX),
          y: Math.min(start.y, curY),
          width:  Math.abs(curX - start.x),
          height: Math.abs(curY - start.y),
        });
      }
    }
    function onMouseUp() {
      if (selecting) {
        setItems(prev => prev.map(it => {
          const overlap = !(
            it.x > marquee.x + marquee.width ||
            it.x + 50 < marquee.x ||
            it.y > marquee.y + marquee.height ||
            it.y + 50 < marquee.y
          );
          return { ...it, selected: overlap };
        }));
        setSelecting(false);
        setMarquee({ x: 0, y: 0, width: 0, height: 0 });
      }
      dragging.current = null;
    }
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup',   onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup',   onMouseUp);
    };
  }, [selecting, marquee]);

  function startDrag(e, item) {
    e.stopPropagation();
    const br = boardRef.current.getBoundingClientRect();
    dragging.current = {
      id:      item.id,
      offsetX: e.clientX - br.left - item.x,
      offsetY: e.clientY - br.top  - item.y,
    };
  }

  function onBoardMouseDown(e) {
    if (e.target === boardRef.current) {
      const br = boardRef.current.getBoundingClientRect();
      const x = e.clientX - br.left;
      const y = e.clientY - br.top;
      marqueeStart.current = { x, y };
      setMarquee({ x, y, width: 0, height: 0 });
      setSelecting(true);
      setItems(prev => prev.map(it => ({ ...it, selected: false })));
    }
  }

  return (
    <div style={styles.main}>
      <div style={styles.header}>
        <button onClick={saveImage}>Save Image</button>
        <button onClick={undo}      disabled={!past.length}>Undo</button>
        <button onClick={redo}      disabled={!future.length}>Redo</button>
        <button onClick={clearAll}> Clear All</button>
      </div>

      <div style={styles.sidebar}>
        <button onClick={() => addShape(Eclipse)}>Add Eclipse</button>
        <button onClick={() => addShape(Rectangle)}>Add Rectangle</button>
        <button onClick={() => addShape(Line)}>Add Line</button>
      </div>

      <div
        style={styles.board}
        ref={boardRef}
        onMouseDown={onBoardMouseDown}
      >
        {items.map(item => {
          const Shape = item.Shape;
          return (
            <Shape
              key={item.id}
              selected={item.selected}
              style={{ left: item.x, top: item.y }}
              onMouseDown={e => startDrag(e, item)}
            />
          );
        })}

        {selecting && (
          <div
            style={{
              ...styles.marquee,
              left:   marquee.x,
              top:    marquee.y,
              width:  marquee.width,
              height: marquee.height,
            }}
          />
        )}
      </div>

      <div style={styles.footer}>
        Press “Delete” to remove selected
      </div>
    </div>
  );
}

// Render into #root
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);

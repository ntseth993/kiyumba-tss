import React, { useRef, useState, useEffect } from 'react';
import { Pencil, Eraser, Square, Circle, Type, Download, Trash2 } from 'lucide-react';
import './Whiteboard.css';

const Whiteboard = ({ className = '' }) => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pencil');
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [snapshot, setSnapshot] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    const context = canvas.getContext('2d');
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

    // Save initial blank canvas
    setSnapshot(context.getImageData(0, 0, canvas.width, canvas.height));
  }, []);

  useEffect(() => {
    if (contextRef.current) {
      contextRef.current.strokeStyle = color;
      contextRef.current.lineWidth = lineWidth;
    }
  }, [color, lineWidth]);

  const startDrawing = (e) => {
    const { offsetX, offsetY } = getCoordinates(e);
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);

    // Save canvas state before starting new drawing
    setSnapshot(contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height));
  };

  const draw = (e) => {
    if (!isDrawing) return;

    const { offsetX, offsetY } = getCoordinates(e);

    switch (tool) {
      case 'pencil':
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        break;
      case 'eraser':
        contextRef.current.strokeStyle = '#ffffff';
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
        contextRef.current.strokeStyle = color;
        break;
      case 'rectangle':
        if (snapshot) {
          contextRef.current.putImageData(snapshot, 0, 0);
          contextRef.current.beginPath();
          const startX = e.nativeEvent.offsetX - offsetX;
          const startY = e.nativeEvent.offsetY - offsetY;
          contextRef.current.rect(startX, startY, offsetX - startX, offsetY - startY);
          contextRef.current.stroke();
        }
        break;
      case 'circle':
        if (snapshot) {
          contextRef.current.putImageData(snapshot, 0, 0);
          contextRef.current.beginPath();
          const centerX = e.nativeEvent.offsetX - offsetX;
          const centerY = e.nativeEvent.offsetY - offsetY;
          const radius = Math.sqrt(
            Math.pow(offsetX - centerX, 2) + Math.pow(offsetY - centerY, 2)
          );
          contextRef.current.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          contextRef.current.stroke();
        }
        break;
      default:
        break;
    }
  };

  const stopDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);
  };

  const getCoordinates = (e) => {
    if (e.touches && e.touches[0]) {
      const rect = canvasRef.current.getBoundingClientRect();
      return {
        offsetX: e.touches[0].clientX - rect.left,
        offsetY: e.touches[0].clientY - rect.top
      };
    }
    return {
      offsetX: e.nativeEvent.offsetX,
      offsetY: e.nativeEvent.offsetY
    };
  };

  const addText = (e) => {
    const text = window.prompt('Enter text:');
    if (text) {
      const { offsetX, offsetY } = getCoordinates(e);
      contextRef.current.font = '16px Arial';
      contextRef.current.fillStyle = color;
      contextRef.current.fillText(text, offsetX, offsetY);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.fillStyle = 'white';
    context.fillRect(0, 0, canvas.width, canvas.height);
  };

  const downloadCanvas = () => {
    const link = document.createElement('a');
    link.download = `whiteboard-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className={`whiteboard ${className}`}>
      <div className="toolbar">
        <button
          className={`tool-btn ${tool === 'pencil' ? 'active' : ''}`}
          onClick={() => setTool('pencil')}
          title="Pencil"
        >
          <Pencil size={20} />
        </button>
        <button
          className={`tool-btn ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
          title="Eraser"
        >
          <Eraser size={20} />
        </button>
        <button
          className={`tool-btn ${tool === 'rectangle' ? 'active' : ''}`}
          onClick={() => setTool('rectangle')}
          title="Rectangle"
        >
          <Square size={20} />
        </button>
        <button
          className={`tool-btn ${tool === 'circle' ? 'active' : ''}`}
          onClick={() => setTool('circle')}
          title="Circle"
        >
          <Circle size={20} />
        </button>
        <button
          className={`tool-btn ${tool === 'text' ? 'active' : ''}`}
          onClick={() => setTool('text')}
          title="Text"
        >
          <Type size={20} />
        </button>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          title="Color"
          className="color-picker"
        />
        <input
          type="range"
          min="1"
          max="10"
          value={lineWidth}
          onChange={(e) => setLineWidth(e.target.value)}
          title="Line Width"
          className="line-width"
        />
        <button
          className="tool-btn"
          onClick={downloadCanvas}
          title="Download"
        >
          <Download size={20} />
        </button>
        <button
          className="tool-btn danger"
          onClick={clearCanvas}
          title="Clear"
        >
          <Trash2 size={20} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className="drawing-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onClick={tool === 'text' ? addText : undefined}
      />
    </div>
  );
};

export default Whiteboard;
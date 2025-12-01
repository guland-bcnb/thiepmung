import React, { useRef, useState } from 'react';
import { Layer, TextLayer, ImageLayer } from '../types';

interface EditorCanvasProps {
  backgroundUrl: string;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  canvasRef: React.RefObject<HTMLDivElement>;
}

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  backgroundUrl,
  layers,
  setLayers,
  selectedLayerId,
  setSelectedLayerId,
  canvasRef
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    const layer = layers.find(l => l.id === layerId);
    if (!layer) return;

    setSelectedLayerId(layerId);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - layer.x,
      y: e.clientY - layer.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedLayerId) return;

    const newX = e.clientX - dragOffset.x;
    const newY = e.clientY - dragOffset.y;

    setLayers(prev => prev.map(l => {
      if (l.id === selectedLayerId) {
        return { ...l, x: newX, y: newY };
      }
      return l;
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = () => {
    if (!isDragging) {
      setSelectedLayerId(null);
    }
  };

  const renderLayer = (layer: Layer) => {
    const isSelected = selectedLayerId === layer.id;
    const commonStyle: React.CSSProperties = {
      position: 'absolute',
      left: layer.x,
      top: layer.y,
      cursor: isDragging && isSelected ? 'grabbing' : 'grab',
      border: isSelected ? '2px dashed rgba(59, 130, 246, 0.5)' : '2px solid transparent',
      padding: '4px',
      touchAction: 'none' // Prevent scrolling on mobile while dragging
    };

    if (layer.type === 'text') {
      const textLayer = layer as TextLayer;
      return (
        <div
          key={layer.id}
          onMouseDown={(e) => handleMouseDown(e, layer.id)}
          style={{
            ...commonStyle,
            color: textLayer.color,
            fontSize: `${textLayer.fontSize}px`,
            fontFamily: textLayer.fontFamily,
            fontWeight: textLayer.fontWeight,
            textAlign: textLayer.textAlign,
            lineHeight: 1.2,
            whiteSpace: 'pre-wrap',
            maxWidth: '90%'
          }}
          className="hover:border-blue-300/30 transition-colors"
        >
          {textLayer.text}
        </div>
      );
    } 
    
    if (layer.type === 'image') {
      const imgLayer = layer as ImageLayer;
      return (
        <div
          key={layer.id}
          onMouseDown={(e) => handleMouseDown(e, layer.id)}
          style={{
            ...commonStyle,
            width: `${imgLayer.width}px`,
            opacity: imgLayer.opacity
          }}
          className="hover:border-blue-300/30 transition-colors"
        >
          <img 
            src={imgLayer.src} 
            alt="Layer" 
            className="w-full h-auto pointer-events-none select-none" 
          />
        </div>
      );
    }

    return null;
  };

  return (
    <div 
      className="w-full h-full bg-gray-100 flex items-center justify-center overflow-hidden p-8 relative select-none"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div 
        className="shadow-2xl relative overflow-hidden bg-white transition-all duration-300"
        ref={canvasRef}
        style={{
          width: '800px',
          height: '500px',
          backgroundImage: `url(${backgroundUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
        onMouseDown={handleCanvasClick}
      >
        {layers.map(layer => renderLayer(layer))}
      </div>
      
      <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs text-gray-500 shadow pointer-events-none">
        800 x 500 px
      </div>
    </div>
  );
};

export default EditorCanvas;
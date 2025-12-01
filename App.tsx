import React, { useState, useRef } from 'react';
import Controls from './components/Controls';
import EditorCanvas from './components/EditorCanvas';
import { CardType, Layer, SavedTemplate, BackgroundTemplate, TextLayer, ImageLayer } from './types';
import { BACKGROUND_TEMPLATES } from './constants';

const App: React.FC = () => {
  const [cardType, setCardType] = useState<CardType>('birthday');
  const [backgroundUrl, setBackgroundUrl] = useState<string>(BACKGROUND_TEMPLATES[0].url);
  
  // Custom user data
  const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundTemplate[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);

  const [layers, setLayers] = useState<Layer[]>([
    {
      id: '1',
      type: 'text',
      text: 'Chúc Mừng Sinh Nhật',
      x: 200,
      y: 50,
      fontSize: 48,
      color: '#FFFFFF',
      fontFamily: 'Playfair Display',
      fontWeight: 'bold',
      textAlign: 'center'
    },
    {
      id: '2',
      type: 'text',
      text: 'Nguyễn Văn A',
      x: 250,
      y: 120,
      fontSize: 32,
      color: '#FFFFFF',
      fontFamily: 'Montserrat',
      fontWeight: 'normal',
      textAlign: 'center'
    }
  ]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // --- Template Management ---

  const handleImportTemplate = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const template = JSON.parse(json) as SavedTemplate;
        
        // Validation basic
        if (!template.layers || !template.backgroundUrl) {
          alert("File JSON không hợp lệ.");
          return;
        }

        // Add to list and apply immediately
        setSavedTemplates(prev => {
           // Check if exists
           if (prev.find(t => t.id === template.id)) return prev;
           return [...prev, { ...template, id: template.id || Date.now().toString() }];
        });
        setLayers(template.layers);
        setBackgroundUrl(template.backgroundUrl);
      } catch (err) {
        console.error(err);
        alert("Lỗi khi đọc file mẫu.");
      }
    };
    reader.readAsText(file);
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  };

  const handleExportTemplate = async () => {
    const name = prompt("Nhập tên mẫu để lưu:", "Mẫu thiết kế mới");
    if (!name) return;

    // 1. Process Background URL (Convert Blob -> Base64)
    let portableBackgroundUrl = backgroundUrl;
    if (backgroundUrl.startsWith('blob:')) {
      try {
        const response = await fetch(backgroundUrl);
        const blob = await response.blob();
        portableBackgroundUrl = await blobToBase64(blob);
      } catch (e) {
        console.warn("Could not convert background to base64", e);
      }
    }

    // 2. Process Image Layers (Convert Blob -> Base64)
    const processedLayers = await Promise.all(layers.map(async (layer) => {
      if (layer.type === 'image' && layer.src.startsWith('blob:')) {
        try {
          const response = await fetch(layer.src);
          const blob = await response.blob();
          const base64 = await blobToBase64(blob);
          return { ...layer, src: base64 };
        } catch (e) {
          console.warn("Could not convert image layer to base64", e);
          return layer;
        }
      }
      return layer;
    }));

    const template: SavedTemplate = {
      id: Date.now().toString(),
      name,
      backgroundUrl: portableBackgroundUrl,
      layers: processedLayers,
      createdAt: Date.now()
    };

    // Save to list
    setSavedTemplates(prev => [...prev, template]);

    // Download JSON
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${name}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleLoadTemplate = (template: SavedTemplate) => {
    setLayers(template.layers);
    setBackgroundUrl(template.backgroundUrl);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Bạn có chắc muốn xóa mẫu này?")) {
      setSavedTemplates(prev => prev.filter(t => t.id !== id));
    }
  };

  // --- Background & Asset Management ---

  const handleAddCustomBackground = (url: string) => {
    const newBg: BackgroundTemplate = {
      id: `custom-${Date.now()}`,
      url,
      name: 'Ảnh tải lên',
      category: 'custom'
    };
    setCustomBackgrounds(prev => [...prev, newBg]);
    setBackgroundUrl(url);
  };

  const handleDeleteCustomBackground = (id: string) => {
    if (confirm("Xóa ảnh nền này khỏi thư viện?")) {
      setCustomBackgrounds(prev => prev.filter(bg => bg.id !== id));
      const deletedBg = customBackgrounds.find(bg => bg.id === id);
      if (deletedBg && backgroundUrl === deletedBg.url) {
        setBackgroundUrl(BACKGROUND_TEMPLATES[0].url);
      }
    }
  };

  // --- Export Image ---

  const handleDownloadImage = () => {
    if (!canvasRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 800;
    const height = 500;
    canvas.width = width;
    canvas.height = height;

    const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });

    (async () => {
      try {
        // Draw Background
        const bgImg = await loadImage(backgroundUrl);
        const hRatio = canvas.width / bgImg.width;
        const vRatio = canvas.height / bgImg.height;
        const ratio = Math.max(hRatio, vRatio);
        const centerShift_x = (canvas.width - bgImg.width * ratio) / 2;
        const centerShift_y = (canvas.height - bgImg.height * ratio) / 2;
        
        ctx.clearRect(0,0,canvas.width, canvas.height);
        ctx.drawImage(
          bgImg, 
          0, 0, bgImg.width, bgImg.height,
          centerShift_x, centerShift_y, bgImg.width * ratio, bgImg.height * ratio
        );

        // Draw Layers
        for (const layer of layers) {
          if (layer.type === 'image') {
            const imgLayer = layer as ImageLayer;
            const imgObj = await loadImage(imgLayer.src);
            ctx.save();
            ctx.globalAlpha = imgLayer.opacity;
            // Maintain aspect ratio based on width
            const aspect = imgObj.height / imgObj.width;
            const drawHeight = imgLayer.width * aspect;
            ctx.drawImage(imgObj, layer.x, layer.y, imgLayer.width, drawHeight);
            ctx.restore();
          } else {
            const textLayer = layer as TextLayer;
            const fontString = `${textLayer.fontWeight} ${textLayer.fontSize}px '${textLayer.fontFamily}'`;
            ctx.font = fontString;
            ctx.fillStyle = textLayer.color;
            ctx.textBaseline = 'top'; 
            ctx.textAlign = textLayer.textAlign === 'center' ? 'center' : textLayer.textAlign === 'right' ? 'right' : 'left';

            const lines = textLayer.text.split('\n');
            const lineHeight = textLayer.fontSize * 1.2;

            lines.forEach((line, index) => {
              // Adjust X based on alignment if needed, though canvas textAlign usually handles anchor point
              // For simplistic drag/drop matching:
              // Left align: x is left
              // Center align: x is center? 
              // Our drag system uses Top-Left X/Y.
              // To fix canvas rendering alignment with Top-Left DOM positioning, we usually just draw at X.
              // But for textAlign='center', ctx.fillText draws at X as the center.
              // We need to measure text or simplify.
              // Simplification: We will draw text as left-aligned relative to the text box for now, 
              // OR we handle the offset. 
              // Let's stick to ctx.fillText(line, layer.x, ...) but we might need to adjust X for 'center'.
              // Since the DOM overlay uses text-align CSS, let's try to match it.
              
              let drawX = layer.x;
              // If we want to support text-align properly in export, we should probably treat X as left boundary 
              // and calculate center manually, or assume the user placed X where they want it.
              // Let's keep it simple: Draw left-aligned at X, Y for now to match the DOM 'absolute' positioning
              // unless we implement width-bounded text boxes.
              
              // However, layer.textAlign affects how lines align relative to each other.
              // We'll trust ctx.textAlign but we need a fixed anchor. 
              // Actually, simplified approach: just draw left aligned for export to match top-left coord system.
              // Or:
              if (textLayer.textAlign === 'center') {
                 // We don't have a defined width for the box, so center align is hard to map 1:1 without width.
                 // We'll force left align in export for consistency with the coordinate system 
                 // unless we measure width.
                 ctx.textAlign = 'left';
              }
              
              ctx.fillText(line, drawX, layer.y + (index * lineHeight));
            });
          }
        }

        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `card-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();

      } catch (err) {
        console.error("Error generating image", err);
        alert("Có lỗi khi tạo ảnh. Vui lòng thử lại hoặc chọn ảnh nền khác.");
      }
    })();
  };

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-gray-50 overflow-hidden">
      <Controls
        cardType={cardType}
        setCardType={setCardType}
        backgroundUrl={backgroundUrl}
        setBackgroundUrl={setBackgroundUrl}
        layers={layers}
        setLayers={setLayers}
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
        onDownload={handleDownloadImage}
        
        // Props for Template & Background Management
        savedTemplates={savedTemplates}
        customBackgrounds={customBackgrounds}
        onImportTemplate={handleImportTemplate}
        onExportTemplate={handleExportTemplate}
        onLoadTemplate={handleLoadTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onAddCustomBackground={handleAddCustomBackground}
        onDeleteCustomBackground={handleDeleteCustomBackground}
      />

      <main className="flex-1 h-full flex flex-col relative">
        <EditorCanvas
          backgroundUrl={backgroundUrl}
          layers={layers}
          setLayers={setLayers}
          selectedLayerId={selectedLayerId}
          setSelectedLayerId={setSelectedLayerId}
          canvasRef={canvasRef}
        />
      </main>
    </div>
  );
};

export default App;
import React, { useState, useRef } from 'react';
import { 
  Type, 
  Image as ImageIcon, 
  Sparkles, 
  Plus, 
  Download, 
  Trash2, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Bold,
  Palette,
  LayoutTemplate,
  Save,
  Upload,
  X,
  FileJson,
  Layers,
  ImagePlus
} from 'lucide-react';
import { BACKGROUND_TEMPLATES, FONTS, COLORS } from '../constants';
import { CardType, Layer, SavedTemplate, BackgroundTemplate, TextLayer, ImageLayer } from '../types';
import { generateWishes } from '../services/gemini';

interface ControlsProps {
  cardType: CardType;
  setCardType: (type: CardType) => void;
  backgroundUrl: string;
  setBackgroundUrl: (url: string) => void;
  layers: Layer[];
  setLayers: React.Dispatch<React.SetStateAction<Layer[]>>;
  selectedLayerId: string | null;
  setSelectedLayerId: (id: string | null) => void;
  onDownload: () => void;
  
  // New Props
  savedTemplates: SavedTemplate[];
  customBackgrounds: BackgroundTemplate[];
  onImportTemplate: (file: File) => void;
  onExportTemplate: () => void;
  onLoadTemplate: (template: SavedTemplate) => void;
  onDeleteTemplate: (id: string) => void;
  onAddCustomBackground: (url: string) => void;
  onDeleteCustomBackground: (id: string) => void;
}

const Controls: React.FC<ControlsProps> = ({
  cardType,
  setCardType,
  backgroundUrl,
  setBackgroundUrl,
  layers,
  setLayers,
  selectedLayerId,
  setSelectedLayerId,
  onDownload,
  savedTemplates,
  customBackgrounds,
  onImportTemplate,
  onExportTemplate,
  onLoadTemplate,
  onDeleteTemplate,
  onAddCustomBackground,
  onDeleteCustomBackground
}) => {
  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'ai'>('content');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [recipientName, setRecipientName] = useState('');
  const [aiContext, setAiContext] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const stickerInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  const handleAddText = () => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      type: 'text',
      text: 'Nhập nội dung...',
      x: 100, // Default position
      y: 100,
      fontSize: 32,
      color: '#000000',
      fontFamily: 'Roboto',
      fontWeight: 'normal',
      textAlign: 'center'
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
    setActiveTab('style');
  };

  const handleAddImageLayer = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newLayer: ImageLayer = {
        id: Date.now().toString(),
        type: 'image',
        src: url,
        x: 150,
        y: 150,
        width: 200,
        opacity: 1
      };
      setLayers([...layers, newLayer]);
      setSelectedLayerId(newLayer.id);
      setActiveTab('style');
    }
    if (stickerInputRef.current) stickerInputRef.current.value = '';
  };

  const updateLayer = (key: keyof TextLayer | keyof ImageLayer, value: any) => {
    if (!selectedLayerId) return;
    setLayers(layers.map(l => l.id === selectedLayerId ? { ...l, [key]: value } as Layer : l));
  };

  const handleDeleteLayer = () => {
    if (!selectedLayerId) return;
    setLayers(layers.filter(l => l.id !== selectedLayerId));
    setSelectedLayerId(null);
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onAddCustomBackground(url);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportTemplate(file);
    }
    if (jsonInputRef.current) jsonInputRef.current.value = '';
  };

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    const suggestions = await generateWishes({
      type: cardType,
      recipientName,
      context: aiContext
    });
    setAiSuggestions(suggestions);
    setIsGenerating(false);
  };

  const applySuggestion = (text: string) => {
    const newLayer: TextLayer = {
      id: Date.now().toString(),
      type: 'text',
      text: text,
      x: 50,
      y: 200,
      fontSize: 24,
      color: '#333333',
      fontFamily: 'Playfair Display',
      fontWeight: 'normal',
      textAlign: 'center'
    };
    setLayers([...layers, newLayer]);
    setSelectedLayerId(newLayer.id);
    setActiveTab('style');
  };

  return (
    <div className="bg-white w-full md:w-96 flex-shrink-0 border-r border-gray-200 h-full flex flex-col shadow-lg z-10">
      {/* Header */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Palette size={20} /> CardGenie
        </h1>
        <button 
          onClick={onDownload}
          className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors flex items-center gap-1 text-xs"
          title="Tải ảnh về (PNG)"
        >
          <Download size={16} /> PNG
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          onClick={() => setActiveTab('content')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <LayoutTemplate size={16} /> Mẫu & Ảnh
        </button>
        <button 
          onClick={() => setActiveTab('ai')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'ai' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Sparkles size={16} /> AI Gợi ý
        </button>
        <button 
          onClick={() => setActiveTab('style')}
          className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'style' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
        >
          <Layers size={16} /> Chỉnh sửa
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar">
        
        {/* TAB: CONTENT (BACKGROUNDS & TEMPLATES) */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            
            {/* Template Actions */}
            <div className="flex gap-2">
               <button 
                onClick={onExportTemplate}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-md text-xs font-medium transition-colors"
              >
                <Save size={14} /> Lưu mẫu (JSON)
              </button>
              <button 
                onClick={() => jsonInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-md text-xs font-medium transition-colors"
              >
                <Upload size={14} /> Nhập JSON
              </button>
              <input 
                type="file" 
                ref={jsonInputRef} 
                className="hidden" 
                accept=".json"
                onChange={handleJsonUpload}
              />
            </div>

            {/* Saved Templates Combo List */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chọn mẫu có sẵn</label>
              <div className="relative">
                <select
                  className="w-full pl-3 pr-8 py-2 border border-gray-300 rounded-md text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  onChange={(e) => {
                    const t = savedTemplates.find(temp => temp.id === e.target.value);
                    if(t) onLoadTemplate(t);
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>-- Chọn mẫu thiết kế --</option>
                  {savedTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} ({new Date(t.createdAt).toLocaleDateString()})</option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▼
                </div>
              </div>
              {savedTemplates.length === 0 && (
                <p className="text-xs text-gray-500 mt-1 italic">Chưa có mẫu nào được lưu.</p>
              )}
            </div>

            <hr className="border-gray-100" />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại thiệp</label>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setCardType('birthday')}
                  className={`py-2 px-3 rounded-md text-sm transition-all ${cardType === 'birthday' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Sinh nhật
                </button>
                <button
                  onClick={() => setCardType('achievement')}
                  className={`py-2 px-3 rounded-md text-sm transition-all ${cardType === 'achievement' ? 'bg-white shadow text-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Thành tích
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh nền</label>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-500 transition-colors bg-gray-50"
                >
                  <ImageIcon size={24} className="mb-1" />
                  <span className="text-xs">Tải ảnh lên</span>
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={handleBgUpload}
                />
                
                {/* Custom User Backgrounds */}
                {customBackgrounds.map(bg => (
                  <div key={bg.id} className="relative group">
                    <button
                      onClick={() => setBackgroundUrl(bg.url)}
                      className={`w-full aspect-video rounded-lg overflow-hidden border-2 ${backgroundUrl === bg.url ? 'border-blue-600' : 'border-transparent'}`}
                    >
                      <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteCustomBackground(bg.id); }}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
                      title="Xóa ảnh này"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}

                {/* Default Backgrounds */}
                {BACKGROUND_TEMPLATES.filter(bg => bg.category === cardType || bg.category === 'simple').map(bg => (
                  <button
                    key={bg.id}
                    onClick={() => setBackgroundUrl(bg.url)}
                    className={`aspect-video rounded-lg overflow-hidden relative group border-2 ${backgroundUrl === bg.url ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <img src={bg.url} alt={bg.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs truncate">{bg.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={handleAddText}
                className="py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium border border-blue-200 text-sm"
              >
                <Type size={16} /> Thêm chữ
              </button>
              <button 
                onClick={() => stickerInputRef.current?.click()}
                className="py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg flex items-center justify-center gap-2 transition-colors font-medium border border-purple-200 text-sm"
              >
                <ImagePlus size={16} /> Thêm ảnh
              </button>
              <input 
                type="file" 
                ref={stickerInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleAddImageLayer}
              />
            </div>
          </div>
        )}

        {/* TAB: AI SUGGESTIONS */}
        {activeTab === 'ai' && (
          <div className="space-y-4">
            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
              <h3 className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-600" />
                Trợ lý nội dung AI
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1">Tên người nhận</label>
                  <input 
                    type="text" 
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="VD: Nguyễn Văn A"
                    className="w-full px-3 py-2 border border-indigo-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-indigo-800 mb-1">Ngữ cảnh (Tùy chọn)</label>
                  <input 
                    type="text" 
                    value={aiContext}
                    onChange={(e) => setAiContext(e.target.value)}
                    placeholder="VD: Sếp, đồng nghiệp thân, tròn 5 năm..."
                    className="w-full px-3 py-2 border border-indigo-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <button
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  className="w-full py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? 'Đang suy nghĩ...' : 'Gợi ý lời chúc'}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {aiSuggestions.length > 0 && <label className="block text-sm font-medium text-gray-700">Kết quả gợi ý:</label>}
              {aiSuggestions.map((suggestion, idx) => (
                <div 
                  key={idx} 
                  onClick={() => applySuggestion(suggestion)}
                  className="p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 hover:shadow-sm cursor-pointer transition-all group"
                >
                  <p className="text-sm text-gray-700 mb-2">{suggestion}</p>
                  <div className="text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    + Thêm vào thiệp
                  </div>
                </div>
              ))}
              {aiSuggestions.length === 0 && !isGenerating && (
                 <div className="text-center py-8 text-gray-400 text-sm">
                   Nhập thông tin và nhấn nút để AI gợi ý nội dung phù hợp.
                 </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: STYLE EDITING */}
        {activeTab === 'style' && (
          <div className="space-y-6">
            {!selectedLayerId || !selectedLayer ? (
              <div className="text-center py-10 text-gray-400">
                <Type className="mx-auto mb-2 opacity-50" size={32} />
                <p>Chọn một thành phần trên thiệp để chỉnh sửa.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between pb-2 border-b">
                   <h3 className="font-medium text-gray-700 capitalize">{selectedLayer.type === 'text' ? 'Văn bản' : 'Hình ảnh'}</h3>
                   <button 
                    onClick={handleDeleteLayer}
                    className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                    title="Xóa"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {selectedLayer.type === 'text' && (
                  <>
                    {/* TEXT CONTROLS */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Nội dung</label>
                      <textarea
                        value={(selectedLayer as TextLayer).text}
                        onChange={(e) => updateLayer('text', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Phông chữ</label>
                      <select
                        value={(selectedLayer as TextLayer).fontFamily}
                        onChange={(e) => updateLayer('fontFamily', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        {FONTS.map(font => (
                          <option key={font.value} value={font.value}>{font.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Cỡ chữ</label>
                        <input 
                          type="range" 
                          min="12" 
                          max="120" 
                          value={(selectedLayer as TextLayer).fontSize}
                          onChange={(e) => updateLayer('fontSize', parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Định dạng</label>
                        <div className="flex bg-gray-100 rounded-md p-1">
                          <button 
                            onClick={() => updateLayer('fontWeight', (selectedLayer as TextLayer).fontWeight === 'bold' ? 'normal' : 'bold')}
                            className={`flex-1 p-1 rounded ${(selectedLayer as TextLayer).fontWeight === 'bold' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                            title="In đậm"
                          >
                            <Bold size={16} className="mx-auto" />
                          </button>
                          <div className="w-px bg-gray-300 mx-1"></div>
                          <button 
                            onClick={() => updateLayer('textAlign', 'left')}
                            className={`flex-1 p-1 rounded ${(selectedLayer as TextLayer).textAlign === 'left' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                          >
                            <AlignLeft size={16} className="mx-auto" />
                          </button>
                          <button 
                            onClick={() => updateLayer('textAlign', 'center')}
                            className={`flex-1 p-1 rounded ${(selectedLayer as TextLayer).textAlign === 'center' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                          >
                            <AlignCenter size={16} className="mx-auto" />
                          </button>
                          <button 
                            onClick={() => updateLayer('textAlign', 'right')}
                            className={`flex-1 p-1 rounded ${(selectedLayer as TextLayer).textAlign === 'right' ? 'bg-white shadow' : 'hover:bg-gray-200'}`}
                          >
                            <AlignRight size={16} className="mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Màu sắc</label>
                      <div className="flex flex-wrap gap-2">
                        {COLORS.map(color => (
                          <button
                            key={color}
                            onClick={() => updateLayer('color', color)}
                            className={`w-8 h-8 rounded-full border border-gray-200 transition-transform hover:scale-110 ${(selectedLayer as TextLayer).color === color ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                        <input 
                          type="color" 
                          value={(selectedLayer as TextLayer).color}
                          onChange={(e) => updateLayer('color', e.target.value)}
                          className="w-8 h-8 p-0 border-0 rounded-full overflow-hidden cursor-pointer"
                        />
                      </div>
                    </div>
                  </>
                )}

                {selectedLayer.type === 'image' && (
                  <>
                    {/* IMAGE CONTROLS */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Kích thước (Chiều rộng)</label>
                      <input 
                        type="range" 
                        min="50" 
                        max="500" 
                        value={(selectedLayer as ImageLayer).width}
                        onChange={(e) => updateLayer('width', parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="text-right text-xs text-gray-400 mt-1">{(selectedLayer as ImageLayer).width}px</div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Độ trong suốt</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.1"
                        value={(selectedLayer as ImageLayer).opacity}
                        onChange={(e) => updateLayer('opacity', parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
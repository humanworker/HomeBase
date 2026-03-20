import React, { useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useStore } from '../store';
import { Plus, ChevronDown, ZoomIn, ZoomOut, Image as ImageIcon } from 'lucide-react';
import PinModal from './PinModal';
import { Pin, Category } from '../types';

const CATEGORY_COLORS: Record<Category, string> = {
  Appliance: 'bg-blue-500',
  Utility: 'bg-orange-500',
  Structure: 'bg-slate-500',
  Furniture: 'bg-amber-500',
  General: 'bg-emerald-500',
  Idea: 'bg-purple-500',
};

export default function FloorPlanView() {
  const { floorPlans, activeFloorPlanId, setActiveFloorPlan, addPin, updatePin, updateFloorPlanImage } = useStore();
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const [movingPinId, setMovingPinId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const imageRef = useRef<HTMLImageElement>(null);

  const activeFloorPlan = floorPlans.find((fp) => fp.id === activeFloorPlanId);
  const filteredPins = activeFloorPlan?.pins.filter(pin => categoryFilter === 'All' || pin.category === categoryFilter) || [];
  const selectedPin = activeFloorPlan?.pins.find((p) => p.id === selectedPinId) || null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeFloorPlan) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updateFloorPlanImage(activeFloorPlan.id, event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin && !movingPinId) {
      setSelectedPinId(null);
      return;
    }
    
    if (!activeFloorPlan || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate percentage coordinates relative to the image
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (movingPinId) {
      updatePin(activeFloorPlan.id, movingPinId, { x, y });
      setMovingPinId(null);
      setSelectedPinId(movingPinId);
      return;
    }

    addPin(activeFloorPlan.id, {
      x,
      y,
      title: 'New Item',
      category: 'General',
      details: '',
      photos: [],
      tasks: [],
    });

    setIsAddingPin(false);
  };

  if (!activeFloorPlan) return null;

  return (
    <div className="h-full flex bg-stone-100 relative">
      {/* In This View Panel */}
      <div className="w-64 bg-white border-r border-stone-200 flex flex-col z-10 shadow-sm flex-shrink-0">
        <div className="p-4 border-b border-stone-100 flex flex-col gap-3">
          <h2 className="font-semibold text-stone-800">In This View</h2>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Category | 'All')}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="All">All Categories</option>
            {Object.keys(CATEGORY_COLORS).map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredPins.map(pin => (
            <button
              key={pin.id}
              onClick={() => {
                setSelectedPinId(pin.id);
              }}
              className={`w-full text-left p-3 rounded-xl border transition-colors ${selectedPinId === pin.id ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-stone-200 hover:border-emerald-300'}`}
            >
              <div className="font-medium text-stone-800 truncate">{pin.title}</div>
              <div className="flex items-center gap-2 mt-1">
                <div className={`w-2 h-2 rounded-full ${CATEGORY_COLORS[pin.category]}`} />
                <div className="text-xs text-stone-500">{pin.category}</div>
              </div>
            </button>
          ))}
          {filteredPins.length === 0 && (
            <div className="text-sm text-stone-500 text-center py-4">No pins found</div>
          )}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 items-end pointer-events-none">
          <button
            onClick={() => {
              setIsAddingPin(!isAddingPin);
              setMovingPinId(null);
            }}
            className={`pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-colors ${
              isAddingPin || movingPinId
                ? 'bg-stone-800 text-white'
                : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            <Plus size={18} />
            {movingPinId ? 'Click on map to move pin' : isAddingPin ? 'Click on map to place pin' : 'Add Pin'}
          </button>

          <label className="pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-colors bg-white text-stone-800 border border-stone-200 hover:bg-stone-50 cursor-pointer">
            <ImageIcon size={18} />
            Update Image
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </label>
        </div>

        {/* Main Content Area */}
          <div 
            className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative"
            onPointerDown={(e) => {
              // Only close if clicking directly on the background, not the image
              if (e.target === e.currentTarget && !isAddingPin && !movingPinId) {
                setSelectedPinId(null);
              }
            }}
          >
            <TransformWrapper
              initialScale={1}
              minScale={1}
              maxScale={3}
              centerOnInit
              disabled={isAddingPin || movingPinId !== null}
            >
              {({ zoomIn, zoomOut }) => (
                <>
                  <div 
                    className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 bg-white p-1.5 rounded-xl shadow-sm border border-stone-200 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                  <button
                    onClick={() => zoomIn(1)}
                    className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Zoom In"
                  >
                    <ZoomIn size={20} />
                  </button>
                  <div className="w-full h-px bg-stone-100" />
                  <button
                    onClick={() => zoomOut(1)}
                    className="p-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
                    title="Zoom Out"
                  >
                    <ZoomOut size={20} />
                  </button>
                </div>
                <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                  <div
                    className="relative inline-block"
                    onPointerDown={(e) => {
                      handleImageClick(e as any);
                    }}
                    style={{ cursor: isAddingPin ? 'crosshair' : 'inherit' }}
                  >
                    <img
                      ref={imageRef}
                      src={activeFloorPlan.image}
                      alt={activeFloorPlan.name}
                      className="max-w-none shadow-lg rounded-lg"
                      style={{ maxHeight: '80vh' }}
                      draggable={false}
                    />
                    
                    {/* Pins */}
                    {filteredPins.map((pin) => (
                      <button
                        key={pin.id}
                        onPointerDown={(e) => {
                          e.stopPropagation();
                          if (!isAddingPin) setSelectedPinId(pin.id);
                        }}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                        style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                      >
                        <div className={`w-3 h-3 rounded-full border-[1.5px] border-white shadow-sm transition-transform duration-200 group-hover:scale-[2] ${CATEGORY_COLORS[pin.category]}`} />
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-white px-2 py-1 rounded shadow text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                          {pin.title}
                        </div>
                      </button>
                    ))}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Pin Detail Modal */}
        {selectedPin && (
          <PinModal
            pin={selectedPin}
            floorPlanId={activeFloorPlan.id}
            onClose={() => setSelectedPinId(null)}
            onMovePin={(pinId) => {
              setMovingPinId(pinId);
              setSelectedPinId(null);
            }}
          />
        )}
      </div>
    </div>
  );
}

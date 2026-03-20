import React, { useState, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { useStore } from '../store';
import { Plus, ChevronDown, ZoomIn, ZoomOut } from 'lucide-react';
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
  const { floorPlans, activeFloorPlanId, setActiveFloorPlan, addPin } = useStore();
  const [selectedPinId, setSelectedPinId] = useState<string | null>(null);
  const [isAddingPin, setIsAddingPin] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);

  const activeFloorPlan = floorPlans.find((fp) => fp.id === activeFloorPlanId);
  const selectedPin = activeFloorPlan?.pins.find((p) => p.id === selectedPinId) || null;

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAddingPin) {
      setSelectedPinId(null);
      return;
    }
    
    if (!activeFloorPlan || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    
    // Calculate percentage coordinates relative to the image
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

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
    <div className="h-full flex flex-col bg-stone-100 relative">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex justify-between items-center pointer-events-none">
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-1 pointer-events-auto flex items-center">
          <select
            value={activeFloorPlan.id}
            onChange={(e) => setActiveFloorPlan(e.target.value)}
            className="appearance-none bg-transparent pl-4 pr-10 py-2 font-medium text-stone-800 focus:outline-none cursor-pointer"
          >
            {floorPlans.map((fp) => (
              <option key={fp.id} value={fp.id}>
                {fp.name}
              </option>
            ))}
          </select>
          <ChevronDown size={16} className="text-stone-400 absolute right-4 pointer-events-none" />
        </div>

        <button
          onClick={() => setIsAddingPin(!isAddingPin)}
          className={`pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-xl font-medium shadow-sm transition-colors ${
            isAddingPin
              ? 'bg-stone-800 text-white'
              : 'bg-white text-stone-800 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          <Plus size={18} />
          {isAddingPin ? 'Click on map to place pin' : 'Add Pin'}
        </button>
      </div>

      {/* Map Area */}
      <div 
        className="flex-1 overflow-hidden cursor-grab active:cursor-grabbing relative"
        onClick={() => {
          if (!isAddingPin) setSelectedPinId(null);
        }}
      >
        <TransformWrapper
          initialScale={1}
          minScale={1}
          maxScale={3}
          centerOnInit
          disabled={isAddingPin}
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
                  onClick={handleImageClick}
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
                  {activeFloorPlan.pins.map((pin) => (
                    <button
                      key={pin.id}
                      onClick={(e) => {
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
        />
      )}
    </div>
  );
}

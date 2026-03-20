import React, { useState } from 'react';
import { Home, Map, CheckSquare, Settings, Plus, GripVertical } from 'lucide-react';
import { useStore } from './store';
import FloorPlanView from './components/FloorPlanView';
import TasksView from './components/TasksView';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableFloorPlanItem({
  fp,
  editingFpId,
  editingFpName,
  setEditingFpName,
  setEditingFpId,
  updateFloorPlan,
  setActiveFloorPlan,
  setActiveTab,
  activeFloorPlanId,
  activeTab,
}: any) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: fp.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group flex items-center relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute -left-6 p-1 text-stone-300 hover:text-stone-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={14} />
      </div>
      {editingFpId === fp.id ? (
        <input
          autoFocus
          value={editingFpName}
          onChange={(e) => setEditingFpName(e.target.value)}
          onBlur={() => {
            if (editingFpName.trim()) updateFloorPlan(fp.id, editingFpName.trim());
            setEditingFpId(null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (editingFpName.trim()) updateFloorPlan(fp.id, editingFpName.trim());
              setEditingFpId(null);
            } else if (e.key === 'Escape') {
              setEditingFpId(null);
            }
          }}
          className="w-full bg-white border border-emerald-500 rounded px-2 py-1 text-sm focus:outline-none"
        />
      ) : (
        <button
          onClick={() => {
            setActiveFloorPlan(fp.id);
            setActiveTab('floorplan');
          }}
          onDoubleClick={() => {
            setEditingFpId(fp.id);
            setEditingFpName(fp.name);
          }}
          className={`w-full text-left px-3 py-1.5 rounded-lg text-sm truncate transition-colors ${
            activeFloorPlanId === fp.id && activeTab === 'floorplan'
              ? 'text-emerald-700 font-medium bg-emerald-50/50'
              : 'text-stone-500 hover:text-stone-800 hover:bg-stone-50'
          }`}
          title="Double-click to rename"
        >
          {fp.name}
        </button>
      )}
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'floorplan' | 'tasks'>('floorplan');
  const { floorPlans, addFloorPlan, activeFloorPlanId, setActiveFloorPlan, updateFloorPlan, reorderFloorPlans } = useStore();
  const [editingFpId, setEditingFpId] = useState<string | null>(null);
  const [editingFpName, setEditingFpName] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = floorPlans.findIndex((fp) => fp.id === active.id);
      const newIndex = floorPlans.findIndex((fp) => fp.id === over.id);
      reorderFloorPlans(oldIndex, newIndex);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          addFloorPlan(file.name.split('.')[0], event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-stone-200 flex flex-col">
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('floorplan')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeTab === 'floorplan'
                  ? 'bg-emerald-50 text-emerald-700 font-medium'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Map size={20} />
              Floor Plans
            </button>

            {floorPlans.length > 0 && (
              <div className="pl-11 pr-2 py-1 space-y-1">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={floorPlans.map((fp) => fp.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {floorPlans.map((fp) => (
                      <SortableFloorPlanItem
                        key={fp.id}
                        fp={fp}
                        editingFpId={editingFpId}
                        editingFpName={editingFpName}
                        setEditingFpName={setEditingFpName}
                        setEditingFpId={setEditingFpId}
                        updateFloorPlan={updateFloorPlan}
                        setActiveFloorPlan={setActiveFloorPlan}
                        setActiveTab={setActiveTab}
                        activeFloorPlanId={activeFloorPlanId}
                        activeTab={activeTab}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
              activeTab === 'tasks'
                ? 'bg-emerald-50 text-emerald-700 font-medium'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <CheckSquare size={20} />
            Tasks
          </button>
        </nav>

        <div className="p-4 border-t border-stone-100">
          <label className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors cursor-pointer">
            <Plus size={18} />
            <span className="font-medium">Add Floor Plan</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden relative">
        {floorPlans.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-stone-100 text-stone-400 rounded-full flex items-center justify-center mb-6">
              <Map size={48} />
            </div>
            <h2 className="text-2xl font-semibold text-stone-800 mb-2">No Floor Plans Yet</h2>
            <p className="text-stone-500 max-w-md mb-8">
              Upload an image of your floor plan to get started. You can add pins, details, and tasks to specific locations in your home.
            </p>
            <label className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer font-medium shadow-sm">
              <Plus size={20} />
              Upload Floor Plan
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        ) : (
          <>
            {activeTab === 'floorplan' && <FloorPlanView />}
            {activeTab === 'tasks' && <TasksView />}
          </>
        )}
      </main>
    </div>
  );
}

import React, { useState } from 'react';
import { Home, Map, CheckSquare, Settings, Plus } from 'lucide-react';
import { useStore } from './store';
import FloorPlanView from './components/FloorPlanView';
import TasksView from './components/TasksView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'floorplan' | 'tasks'>('floorplan');
  const { floorPlans, addFloorPlan } = useStore();

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
        <div className="p-6 flex items-center gap-3 border-b border-stone-100">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
            <Home size={24} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-stone-800">HomeBase</h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
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

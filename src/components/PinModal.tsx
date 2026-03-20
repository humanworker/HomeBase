import React, { useState } from 'react';
import { X, Trash2, Plus, Calendar, Image as ImageIcon, CheckCircle2, Circle } from 'lucide-react';
import { useStore } from '../store';
import { Pin, Category, Task } from '../types';
import { format, parseISO } from 'date-fns';

interface PinModalProps {
  pin: Pin;
  floorPlanId: string;
  onClose: () => void;
}

const CATEGORIES: Category[] = ['Appliance', 'Utility', 'Structure', 'Furniture', 'General'];

export default function PinModal({ pin, floorPlanId, onClose }: PinModalProps) {
  const { updatePin, deletePin, addTask, updateTask, deleteTask, completeTask } = useStore();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringInterval: 'months',
    recurringValue: 1,
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          updatePin(floorPlanId, pin.id, {
            photos: [...pin.photos, event.target.result as string],
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddTask = () => {
    if (!newTask.title || !newTask.dueDate) return;
    
    addTask(floorPlanId, pin.id, {
      title: newTask.title,
      dueDate: new Date(newTask.dueDate).toISOString(),
      isRecurring: newTask.isRecurring || false,
      recurringInterval: newTask.recurringInterval,
      recurringValue: newTask.recurringValue,
      completed: false,
    });
    
    setIsAddingTask(false);
    setNewTask({
      title: '',
      dueDate: new Date().toISOString().split('T')[0],
      isRecurring: false,
      recurringInterval: 'months',
      recurringValue: 1,
    });
  };

  return (
    <div className="absolute top-0 right-0 w-96 h-full bg-white shadow-2xl border-l border-stone-200 flex flex-col z-50 animate-in slide-in-from-right">
      {/* Header */}
      <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50">
        <input
          type="text"
          value={pin.title}
          onChange={(e) => updatePin(floorPlanId, pin.id, { title: e.target.value })}
          className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1 w-full mr-4"
          placeholder="Item Name"
        />
        <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200 transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Category */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-500 uppercase tracking-wider">Category</label>
          <select
            value={pin.category}
            onChange={(e) => updatePin(floorPlanId, pin.id, { category: e.target.value as Category })}
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Details */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-500 uppercase tracking-wider">Details & Notes</label>
          <textarea
            value={pin.details}
            onChange={(e) => updatePin(floorPlanId, pin.id, { details: e.target.value })}
            placeholder="Model numbers, paint colors, contractor info..."
            className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-y"
          />
        </div>

        {/* Photos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-500 uppercase tracking-wider">Photos</label>
            <label className="text-emerald-600 hover:text-emerald-700 text-sm font-medium cursor-pointer flex items-center gap-1">
              <Plus size={16} /> Add
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </label>
          </div>
          
          {pin.photos.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {pin.photos.map((photo, idx) => (
                <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-stone-200">
                  <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => updatePin(floorPlanId, pin.id, { photos: pin.photos.filter((_, i) => i !== idx) })}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-stone-50 border border-dashed border-stone-300 rounded-xl p-6 text-center text-stone-400 flex flex-col items-center justify-center">
              <ImageIcon size={24} className="mb-2 opacity-50" />
              <span className="text-sm">No photos yet</span>
            </div>
          )}
        </div>

        {/* Tasks */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-stone-500 uppercase tracking-wider">Tasks & Reminders</label>
            <button
              onClick={() => setIsAddingTask(true)}
              className="text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center gap-1"
            >
              <Plus size={16} /> Add
            </button>
          </div>

          {isAddingTask && (
            <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
              <input
                type="text"
                placeholder="Task title (e.g., Change filter)"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              
              <label className="flex items-center gap-2 text-sm text-stone-700">
                <input
                  type="checkbox"
                  checked={newTask.isRecurring}
                  onChange={(e) => setNewTask({ ...newTask, isRecurring: e.target.value === 'on' })}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                Recurring task
              </label>

              {newTask.isRecurring && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-stone-500">Every</span>
                  <input
                    type="number"
                    min="1"
                    value={newTask.recurringValue}
                    onChange={(e) => setNewTask({ ...newTask, recurringValue: parseInt(e.target.value) || 1 })}
                    className="w-16 bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <select
                    value={newTask.recurringInterval}
                    onChange={(e) => setNewTask({ ...newTask, recurringInterval: e.target.value as any })}
                    className="flex-1 bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleAddTask}
                  className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Save Task
                </button>
                <button
                  onClick={() => setIsAddingTask(false)}
                  className="flex-1 bg-stone-200 text-stone-700 rounded-lg py-2 text-sm font-medium hover:bg-stone-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {pin.tasks.map((task) => (
              <div key={task.id} className={`flex items-start gap-3 p-3 rounded-xl border ${task.completed ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-stone-200 shadow-sm'}`}>
                <button
                  onClick={() => completeTask(floorPlanId, pin.id, task.id)}
                  disabled={task.completed}
                  className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors disabled:hover:text-stone-400"
                >
                  {task.completed ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Circle size={20} />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium text-stone-800 truncate ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-stone-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                    </span>
                    {task.isRecurring && (
                      <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                        Every {task.recurringValue} {task.recurringInterval}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => deleteTask(floorPlanId, pin.id, task.id)}
                  className="text-stone-300 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {pin.tasks.length === 0 && !isAddingTask && (
              <p className="text-sm text-stone-400 italic text-center py-4">No tasks added yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-stone-100 bg-stone-50">
        <button
          onClick={() => {
            if (confirm('Are you sure you want to delete this pin?')) {
              deletePin(floorPlanId, pin.id);
              onClose();
            }
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <Trash2 size={18} />
          Delete Pin
        </button>
      </div>
    </div>
  );
}

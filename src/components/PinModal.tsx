import React, { useState } from 'react';
import { X, Trash2, Plus, Calendar, Image as ImageIcon, CheckCircle2, Circle, Move, ArrowRightLeft } from 'lucide-react';
import { useStore } from '../store';
import { Pin, Category, Task } from '../types';
import { format, parseISO } from 'date-fns';

interface PinModalProps {
  pin: Pin;
  floorPlanId: string;
  onClose: () => void;
  inline?: boolean;
  onMovePin?: (pinId: string) => void;
}

const CATEGORIES: Category[] = ['Appliance', 'Utility', 'Structure', 'Furniture', 'General', 'Idea'];

export default function PinModal({ pin, floorPlanId, onClose, inline = false, onMovePin }: PinModalProps) {
  const { floorPlans, updatePin, deletePin, addTask, updateTask, deleteTask, completeTask, transferPin } = useStore();
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskTitle, setEditingTaskTitle] = useState('');
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    dueDate: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringInterval: 'months',
    recurringValue: 1,
  });

  const otherFloorPlans = floorPlans.filter(fp => fp.id !== floorPlanId);

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
    <div className={`${inline ? 'w-full h-auto flex flex-col' : 'absolute top-0 right-0 w-96 h-full bg-white shadow-2xl border-l border-stone-200 flex flex-col z-50 animate-in slide-in-from-right'}`}>
      {/* Header */}
      <div className={`${inline ? 'p-3' : 'p-4'} border-b border-stone-100 flex items-center justify-between bg-stone-50`}>
        <input
          type="text"
          value={pin.title}
          onChange={(e) => updatePin(floorPlanId, pin.id, { title: e.target.value })}
          className={`${inline ? 'text-lg' : 'text-xl'} font-semibold bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded px-2 py-1 w-full mr-4`}
          placeholder="Item Name"
        />
        {!inline && (
          <button onPointerDown={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-200 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      <div className={`flex-1 overflow-y-auto ${inline ? 'p-4 space-y-4' : 'p-6 space-y-8'}`}>
        <div className={inline ? "grid grid-cols-2 gap-4" : "space-y-8"}>
          {/* Category */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Category</label>
            <select
              value={pin.category}
              onChange={(e) => updatePin(floorPlanId, pin.id, { category: e.target.value as Category })}
              className={`w-full bg-stone-50 border border-stone-200 rounded-xl px-3 ${inline ? 'py-1.5 text-sm' : 'py-2.5'} text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500`}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Details */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Details & Notes</label>
            <textarea
              value={pin.details}
              onChange={(e) => updatePin(floorPlanId, pin.id, { details: e.target.value })}
              placeholder="Model numbers, paint colors, contractor info..."
              className={`w-full bg-stone-50 border border-stone-200 rounded-xl px-3 ${inline ? 'py-2 min-h-[60px] text-sm' : 'py-3 min-h-[120px]'} text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-y`}
            />
          </div>
        </div>

        <div className={inline ? "grid grid-cols-2 gap-4" : "space-y-8"}>
          {/* Photos */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Photos</label>
              <label className="text-emerald-600 hover:text-emerald-700 text-xs font-medium cursor-pointer flex items-center gap-1">
                <Plus size={14} /> Add
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            
            {pin.photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {pin.photos.map((photo, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-stone-200">
                    <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      onClick={() => updatePin(floorPlanId, pin.id, { photos: pin.photos.filter((_, i) => i !== idx) })}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`bg-stone-50 border border-dashed border-stone-300 rounded-xl ${inline ? 'p-3' : 'p-6'} text-center text-stone-400 flex flex-col items-center justify-center`}>
                <ImageIcon size={inline ? 16 : 24} className="mb-1 opacity-50" />
                <span className="text-xs">No photos</span>
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-stone-500 uppercase tracking-wider">Tasks</label>
              <button
                onClick={() => setIsAddingTask(true)}
                className="text-emerald-600 hover:text-emerald-700 text-xs font-medium flex items-center gap-1"
              >
                <Plus size={14} /> Add
              </button>
            </div>

            {isAddingTask && (
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-3 space-y-2">
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full bg-white border border-stone-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                
                <label className="flex items-center gap-2 text-xs text-stone-700">
                  <input
                    type="checkbox"
                    checked={newTask.isRecurring}
                    onChange={(e) => setNewTask({ ...newTask, isRecurring: e.target.value === 'on' })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  Recurring
                </label>

                {newTask.isRecurring && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-stone-500">Every</span>
                    <input
                      type="number"
                      min="1"
                      value={newTask.recurringValue}
                      onChange={(e) => setNewTask({ ...newTask, recurringValue: parseInt(e.target.value) || 1 })}
                      className="w-12 bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <select
                      value={newTask.recurringInterval}
                      onChange={(e) => setNewTask({ ...newTask, recurringInterval: e.target.value as any })}
                      className="flex-1 bg-white border border-stone-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="days">Days</option>
                      <option value="weeks">Weeks</option>
                      <option value="months">Months</option>
                      <option value="years">Years</option>
                    </select>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={handleAddTask}
                    className="flex-1 bg-emerald-600 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-emerald-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsAddingTask(false)}
                    className="flex-1 bg-stone-200 text-stone-700 rounded-lg py-1.5 text-xs font-medium hover:bg-stone-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              {pin.tasks.map((task) => (
                <div key={task.id} className={`flex items-start gap-2 p-2 rounded-lg border ${task.completed ? 'bg-stone-50 border-stone-100 opacity-60' : 'bg-white border-stone-200 shadow-sm'}`}>
                  <button
                    onClick={() => completeTask(floorPlanId, pin.id, task.id)}
                    disabled={task.completed}
                    className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors disabled:hover:text-stone-400"
                  >
                    {task.completed ? <CheckCircle2 className="text-emerald-500" size={16} /> : <Circle size={16} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    {editingTaskId === task.id ? (
                      <input
                        autoFocus
                        value={editingTaskTitle}
                        onChange={(e) => setEditingTaskTitle(e.target.value)}
                        onBlur={() => {
                          if (editingTaskTitle.trim()) {
                            updateTask(floorPlanId, pin.id, task.id, { title: editingTaskTitle.trim() });
                          }
                          setEditingTaskId(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            if (editingTaskTitle.trim()) {
                              updateTask(floorPlanId, pin.id, task.id, { title: editingTaskTitle.trim() });
                            }
                            setEditingTaskId(null);
                          } else if (e.key === 'Escape') {
                            setEditingTaskId(null);
                          }
                        }}
                        className="w-full bg-white border border-emerald-500 rounded px-1.5 py-0.5 text-xs font-medium text-stone-800 focus:outline-none mb-0.5"
                      />
                    ) : (
                      <p 
                        onDoubleClick={() => {
                          setEditingTaskId(task.id);
                          setEditingTaskTitle(task.title);
                        }}
                        className={`text-xs font-medium text-stone-800 truncate cursor-text ${task.completed ? 'line-through opacity-60' : ''}`}
                        title="Double-click to edit"
                      >
                        {task.title}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-stone-500">
                      <span className="flex items-center gap-0.5">
                        <Calendar size={10} />
                        {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                      </span>
                      {task.isRecurring && (
                        <span className="bg-emerald-100 text-emerald-700 px-1 py-0.5 rounded font-medium">
                          Every {task.recurringValue} {task.recurringInterval}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteTask(floorPlanId, pin.id, task.id)}
                    className="text-stone-300 hover:text-red-500 transition-colors p-0.5"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {pin.tasks.length === 0 && !isAddingTask && (
                <p className="text-xs text-stone-400 italic text-center py-2">No tasks</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className={`${inline ? 'p-3' : 'p-4'} border-t border-stone-100 bg-stone-50 space-y-2`}>
        {isTransferring ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-stone-600 font-medium mb-1">Select destination floor plan:</p>
            {otherFloorPlans.length === 0 ? (
              <p className="text-sm text-stone-500 italic">No other floor plans available.</p>
            ) : (
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {otherFloorPlans.map(fp => (
                  <button
                    key={fp.id}
                    onClick={() => {
                      transferPin(pin.id, floorPlanId, fp.id);
                      onClose();
                    }}
                    className="w-full text-left px-3 py-2 text-sm bg-white border border-stone-200 rounded-lg hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors"
                  >
                    {fp.name}
                  </button>
                ))}
              </div>
            )}
            <button
              onClick={() => setIsTransferring(false)}
              className="w-full bg-stone-200 text-stone-700 rounded-xl py-2 text-sm font-medium hover:bg-stone-300 transition-colors mt-2"
            >
              Cancel
            </button>
          </div>
        ) : isConfirmingDelete ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm text-stone-600 text-center font-medium mb-1">Are you sure you want to delete this pin?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  deletePin(floorPlanId, pin.id);
                  onClose();
                }}
                className="flex-1 bg-red-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setIsConfirmingDelete(false)}
                className="flex-1 bg-stone-200 text-stone-700 rounded-xl py-2.5 text-sm font-medium hover:bg-stone-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-2">
              <button
                onClick={() => onMovePin?.(pin.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors font-medium text-sm"
              >
                <Move size={16} />
                Move
              </button>
              <button
                onClick={() => setIsTransferring(true)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-xl transition-colors font-medium text-sm"
              >
                <ArrowRightLeft size={16} />
                Transfer
              </button>
            </div>
            <button
              onClick={() => setIsConfirmingDelete(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium text-sm"
            >
              <Trash2 size={16} />
              Delete Pin
            </button>
          </>
        )}
      </div>
    </div>
  );
}

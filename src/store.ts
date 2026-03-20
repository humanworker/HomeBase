import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
import { FloorPlan, Pin, Task } from './types';
import { v4 as uuidv4 } from 'uuid';
import { add } from 'date-fns';

const idbStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

interface AppState {
  floorPlans: FloorPlan[];
  activeFloorPlanId: string | null;
  addFloorPlan: (name: string, image: string) => void;
  updateFloorPlan: (id: string, name: string) => void;
  reorderFloorPlans: (startIndex: number, endIndex: number) => void;
  updateFloorPlanImage: (id: string, image: string) => void;
  setActiveFloorPlan: (id: string) => void;
  addPin: (floorPlanId: string, pin: Omit<Pin, 'id'>) => void;
  updatePin: (floorPlanId: string, pinId: string, pin: Partial<Pin>) => void;
  deletePin: (floorPlanId: string, pinId: string) => void;
  transferPin: (pinId: string, sourceId: string, targetId: string) => void;
  addTask: (floorPlanId: string, pinId: string, task: Omit<Task, 'id'>) => void;
  updateTask: (floorPlanId: string, pinId: string, taskId: string, task: Partial<Task>) => void;
  deleteTask: (floorPlanId: string, pinId: string, taskId: string) => void;
  completeTask: (floorPlanId: string, pinId: string, taskId: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (setStore, get) => ({
      floorPlans: [],
      activeFloorPlanId: null,

      addFloorPlan: (name, image) => {
        const id = uuidv4();
        setStore((state) => ({
          floorPlans: [...state.floorPlans, { id, name, image, pins: [] }],
          activeFloorPlanId: state.activeFloorPlanId || id,
        }));
      },

      updateFloorPlan: (id, name) => {
        setStore((state) => ({
          floorPlans: state.floorPlans.map((fp) =>
            fp.id === id ? { ...fp, name } : fp
          ),
        }));
      },

      reorderFloorPlans: (startIndex, endIndex) => {
        setStore((state) => {
          const result = Array.from(state.floorPlans);
          const [removed] = result.splice(startIndex, 1);
          result.splice(endIndex, 0, removed);
          return { floorPlans: result };
        });
      },

      updateFloorPlanImage: (id, image) => {
        setStore((state) => ({
          floorPlans: state.floorPlans.map((fp) =>
            fp.id === id ? { ...fp, image } : fp
          ),
        }));
      },

      setActiveFloorPlan: (id) => setStore({ activeFloorPlanId: id }),

      addPin: (floorPlanId, pinData) => {
        setStore((state) => ({
          floorPlans: state.floorPlans.map((fp) =>
            fp.id === floorPlanId
              ? { ...fp, pins: [...fp.pins, { ...pinData, id: uuidv4() }] }
              : fp
          ),
        }));
      },

      updatePin: (floorPlanId, pinId, pinData) => {
        setStore((state) => ({
          floorPlans: state.floorPlans.map((fp) =>
            fp.id === floorPlanId
              ? {
                  ...fp,
                  pins: fp.pins.map((p) =>
                    p.id === pinId ? { ...p, ...pinData } : p
                  ),
                }
              : fp
          ),
        }));
      },

      deletePin: (floorPlanId, pinId) => {
        setStore((state) => ({
          floorPlans: state.floorPlans.map((fp) =>
            fp.id === floorPlanId
              ? { ...fp, pins: fp.pins.filter((p) => p.id !== pinId) }
              : fp
          ),
        }));
      },

      transferPin: (pinId, sourceId, targetId) => {
        setStore((state) => {
          const sourceFp = state.floorPlans.find((fp) => fp.id === sourceId);
          if (!sourceFp) return state;
          
          const pin = sourceFp.pins.find((p) => p.id === pinId);
          if (!pin) return state;

          // Position the pin to the left of the new floor plan
          const transferredPin = { ...pin, x: 5, y: 50 };

          return {
            floorPlans: state.floorPlans.map((fp) => {
              if (fp.id === sourceId) {
                return { ...fp, pins: fp.pins.filter((p) => p.id !== pinId) };
              }
              if (fp.id === targetId) {
                return { ...fp, pins: [...fp.pins, transferredPin] };
              }
              return fp;
            }),
          };
        });
      },

      addTask: (floorPlanId, pinId, taskData) => {
        setStore((state) => ({
          floorPlans: state.floorPlans.map((fp) =>
            fp.id === floorPlanId
              ? {
                  ...fp,
                  pins: fp.pins.map((p) =>
                    p.id === pinId
                      ? { ...p, tasks: [...p.tasks, { ...taskData, id: uuidv4() }] }
                      : p
                  ),
                }
              : fp
          ),
        }));
      },

      updateTask: (floorPlanId, pinId, taskId, taskData) => {
        setStore((state) => ({
          floorPlans: state.floorPlans.map((fp) =>
            fp.id === floorPlanId
              ? {
                  ...fp,
                  pins: fp.pins.map((p) =>
                    p.id === pinId
                      ? {
                          ...p,
                          tasks: p.tasks.map((t) =>
                            t.id === taskId ? { ...t, ...taskData } : t
                          ),
                        }
                      : p
                  ),
                }
              : fp
          ),
        }));
      },

      deleteTask: (floorPlanId, pinId, taskId) => {
        setStore((state) => ({
          floorPlans: state.floorPlans.map((fp) =>
            fp.id === floorPlanId
              ? {
                  ...fp,
                  pins: fp.pins.map((p) =>
                    p.id === pinId
                      ? { ...p, tasks: p.tasks.filter((t) => t.id !== taskId) }
                      : p
                  ),
                }
              : fp
          ),
        }));
      },

      completeTask: (floorPlanId, pinId, taskId) => {
        setStore((state) => {
          const newFloorPlans = [...state.floorPlans];
          const fpIndex = newFloorPlans.findIndex((fp) => fp.id === floorPlanId);
          if (fpIndex === -1) return state;

          const pIndex = newFloorPlans[fpIndex].pins.findIndex((p) => p.id === pinId);
          if (pIndex === -1) return state;

          const tIndex = newFloorPlans[fpIndex].pins[pIndex].tasks.findIndex((t) => t.id === taskId);
          if (tIndex === -1) return state;

          const task = newFloorPlans[fpIndex].pins[pIndex].tasks[tIndex];

          if (task.isRecurring && task.recurringInterval && task.recurringValue) {
            // Create a new task for the next occurrence
            const nextDate = add(new Date(task.dueDate), {
              [task.recurringInterval]: task.recurringValue,
            });
            
            newFloorPlans[fpIndex].pins[pIndex].tasks.push({
              ...task,
              id: uuidv4(),
              dueDate: nextDate.toISOString(),
              completed: false,
            });
          }

          // Mark current task as completed
          newFloorPlans[fpIndex].pins[pIndex].tasks[tIndex] = {
            ...task,
            completed: true,
          };

          return { floorPlans: newFloorPlans };
        });
      },
    }),
    {
      name: 'homebase-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
);

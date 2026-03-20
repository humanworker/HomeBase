import { useState, useMemo } from 'react';
import { useStore } from '../store';
import { format, parseISO, isPast, isToday, isTomorrow, addDays } from 'date-fns';
import { CheckCircle2, Circle, Calendar, MapPin } from 'lucide-react';

export default function TasksView() {
  const { floorPlans, completeTask } = useStore();

  const allTasks = useMemo(() => {
    const tasks: Array<{
      task: any;
      pinTitle: string;
      floorPlanName: string;
      floorPlanId: string;
      pinId: string;
    }> = [];

    floorPlans.forEach((fp) => {
      fp.pins.forEach((pin) => {
        pin.tasks.forEach((task) => {
          if (!task.completed) {
            tasks.push({
              task,
              pinTitle: pin.title,
              floorPlanName: fp.name,
              floorPlanId: fp.id,
              pinId: pin.id,
            });
          }
        });
      });
    });

    return tasks.sort((a, b) => new Date(a.task.dueDate).getTime() - new Date(b.task.dueDate).getTime());
  }, [floorPlans]);

  const getTaskGroup = (dueDate: string) => {
    const date = parseISO(dueDate);
    if (isPast(date) && !isToday(date)) return 'Overdue';
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    if (date < addDays(new Date(), 7)) return 'This Week';
    return 'Upcoming';
  };

  const groupedTasks = useMemo(() => {
    const groups: Record<string, typeof allTasks> = {
      'Overdue': [],
      'Today': [],
      'Tomorrow': [],
      'This Week': [],
      'Upcoming': [],
    };

    allTasks.forEach((t) => {
      groups[getTaskGroup(t.task.dueDate)].push(t);
    });

    return groups;
  }, [allTasks]);

  if (allTasks.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-stone-50">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={48} />
        </div>
        <h2 className="text-2xl font-semibold text-stone-800 mb-2">All Caught Up!</h2>
        <p className="text-stone-500 max-w-md">
          You don't have any pending tasks. Add tasks to pins on your floor plan to see them here.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full bg-stone-50 overflow-y-auto p-8">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900 mb-2">Tasks</h1>
          <p className="text-stone-500">Manage all your recurring and one-off home maintenance tasks.</p>
        </div>

        {(Object.entries(groupedTasks) as [string, typeof allTasks][]).map(([groupName, tasks]) => {
          if (tasks.length === 0) return null;

          return (
            <div key={groupName} className="space-y-4">
              <h2 className={`text-lg font-semibold flex items-center gap-2 ${
                groupName === 'Overdue' ? 'text-red-600' : 'text-stone-800'
              }`}>
                {groupName}
                <span className="bg-stone-200 text-stone-600 text-xs py-0.5 px-2 rounded-full font-medium">
                  {tasks.length}
                </span>
              </h2>

              <div className="space-y-3">
                {tasks.map(({ task, pinTitle, floorPlanName, floorPlanId, pinId }) => (
                  <div
                    key={task.id}
                    className="bg-white border border-stone-200 rounded-2xl p-4 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow group"
                  >
                    <button
                      onClick={() => completeTask(floorPlanId, pinId, task.id)}
                      className="mt-1 text-stone-300 hover:text-emerald-600 transition-colors"
                    >
                      <Circle size={24} />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-stone-900 mb-1">{task.title}</h3>
                      
                      <div className="flex items-center gap-1.5 text-sm text-stone-500 mb-2">
                        <MapPin size={16} className="shrink-0" />
                        <span className="truncate">{floorPlanName} &rsaquo; {pinTitle}</span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-500">
                        <span className={`flex items-center gap-1.5 font-medium ${
                          groupName === 'Overdue' ? 'text-red-600' : ''
                        }`}>
                          <Calendar size={16} />
                          {format(parseISO(task.dueDate), 'MMM d, yyyy')}
                        </span>

                        {task.isRecurring && (
                          <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-medium text-xs border border-emerald-100">
                            Every {task.recurringValue} {task.recurringInterval}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

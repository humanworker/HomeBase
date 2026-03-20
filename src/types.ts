export type Category = 'Appliance' | 'Utility' | 'Structure' | 'Furniture' | 'General';

export interface Task {
  id: string;
  title: string;
  dueDate: string; // ISO string
  isRecurring: boolean;
  recurringInterval?: 'days' | 'weeks' | 'months' | 'years';
  recurringValue?: number;
  completed: boolean;
}

export interface Pin {
  id: string;
  x: number; // percentage relative to image width
  y: number; // percentage relative to image height
  title: string;
  category: Category;
  details: string;
  photos: string[]; // base64 strings
  tasks: Task[];
}

export interface FloorPlan {
  id: string;
  name: string;
  image: string; // base64
  pins: Pin[];
}

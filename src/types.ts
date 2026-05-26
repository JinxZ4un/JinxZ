/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Exercise {
  id: string;
  name: string;
  target: string;
  description: string;
  instructions: string[];
  sets: number;
  reps: string;
  category: 'strength' | 'cardio' | 'flexibility';
}

export interface DayRoutine {
  day: string;
  title: string;
  exercises: string[]; // Reference exercise IDs
  nutritionalFocus: string;
}

export interface NutritionItem {
  name: string;
  benefit: string;
  category: 'protein' | 'carb' | 'fat' | 'supplement';
  icon: string;
}

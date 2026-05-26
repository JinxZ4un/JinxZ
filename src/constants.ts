/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Exercise, DayRoutine, NutritionItem } from './types';

export const EXERCISES: Record<string, Exercise> = {
  'bench-press': {
    id: 'bench-press',
    name: 'Barbell Bench Press',
    target: 'Chest, Triceps, Shoulders',
    description: 'The classic chest builder for upper body mass.',
    instructions: [
      'Lie flat on your back on a bench.',
      'Grip the bar with hands slightly wider than shoulder-width.',
      'Lower the bar slowly to your mid-chest.',
      'Push the bar back up until arms are fully extended.'
    ],
    sets: 4,
    reps: '8-12',
    category: 'strength'
  },
  'deadlift': {
    id: 'deadlift',
    name: 'Conventional Deadlift',
    target: 'Back, Hamstrings, Glutes, Core',
    description: 'The ultimate full-body power movement.',
    instructions: [
      'Stand with feet hip-width apart, bar over mid-foot.',
      'Bend at hips and knees, grab bar with shoulder-width grip.',
      'Keep back flat, chest up, and pull bar up while standing tall.',
      'Lower bar slowly back to the ground.'
    ],
    sets: 3,
    reps: '5-8',
    category: 'strength'
  },
  'squats': {
    id: 'squats',
    name: 'Barbell Back Squat',
    target: 'Quads, Glutes, Hamstrings',
    description: 'The king of leg exercises.',
    instructions: [
      'Place bar on your upper traps.',
      'Stand with feet shoulder-width apart.',
      'Hinge hips back and bend knees until thighs are parallel to floor.',
      'Drive through heels to return to standing position.'
    ],
    sets: 4,
    reps: '10-12',
    category: 'strength'
  },
  'overhead-press': {
    id: 'overhead-press',
    name: 'Military Press',
    target: 'Shoulders, Triceps',
    description: 'Build powerful, broad shoulders.',
    instructions: [
      'Stand with feet shoulder-width apart.',
      'Hold bar at chest level with an overhand grip.',
      'Press the bar directly overhead until arms lock.',
      'Lower back to chest level with control.'
    ],
    sets: 3,
    reps: '8-10',
    category: 'strength'
  },
  'pull-ups': {
    id: 'pull-ups',
    name: 'Pull-Ups',
    target: 'Back, Biceps',
    description: 'Effective bodyweight movement for back width.',
    instructions: [
      'Grip the pull-up bar with palms facing away.',
      'Pull your body up until your chin is over the bar.',
      'Lower yourself slowly back to a dead hang position.'
    ],
    sets: 3,
    reps: 'AMRAP (As Many As Possible)',
    category: 'strength'
  },
  'bicep-curls': {
    id: 'bicep-curls',
    name: 'Dumbbell Bicep Curls',
    target: 'Biceps',
    description: 'Isolation movement for arm measurement.',
    instructions: [
      'Hold dumbbells at your sides, palms facing forward.',
      'Curl the weights toward your shoulders while keeping elbows pinned.',
      'Squeeze at the top and lower slowly.'
    ],
    sets: 3,
    reps: '12-15',
    category: 'strength'
  },
  'tricep-dips': {
    id: 'tricep-dips',
    name: 'Tricep Dips',
    target: 'Triceps, Chest',
    description: 'Great for building the back of the arms.',
    instructions: [
      'Grab parallel bars and support your weight.',
      'Lower your body by bending elbows until arms are at 90 degrees.',
      'Push back up to starting position.'
    ],
    sets: 3,
    reps: '10-15',
    category: 'strength'
  },
  'lunges': {
    id: 'lunges',
    name: 'Walking Lunges',
    target: 'Quads, Glutes',
    description: 'Unilateral leg strength and stability.',
    instructions: [
      'Step forward with one leg and lower hips until both knees are at 90 deg.',
      'Keep front knee above ankle.',
      'Push through front heel to step forward with back leg into next lunge.'
    ],
    sets: 3,
    reps: '10 per leg',
    category: 'strength'
  }
};

export const ROUTINE: DayRoutine[] = [
  {
    day: 'Monday',
    title: 'Chest & Triceps (Push)',
    exercises: ['bench-press', 'overhead-press', 'tricep-dips'],
    nutritionalFocus: 'High protein intake to repair chest fibers.'
  },
  {
    day: 'Tuesday',
    title: 'Back & Biceps (Pull)',
    exercises: ['deadlift', 'pull-ups', 'bicep-curls'],
    nutritionalFocus: 'Magnesium and Zinc for muscle recovery.'
  },
  {
    day: 'Wednesday',
    title: 'Leg Day (Lower)',
    exercises: ['squats', 'lunges'],
    nutritionalFocus: 'Complex carbs for heavy lifting energy.'
  },
  {
    day: 'Thursday',
    title: 'Shoulders & Core',
    exercises: ['overhead-press', 'tricep-dips'], // Reusing some for simplicity or could add more
    nutritionalFocus: 'Hydration and electrolytes are key today.'
  },
  {
    day: 'Friday',
    title: 'Full Body Power',
    exercises: ['squats', 'bench-press', 'deadlift'],
    nutritionalFocus: 'Caloric surplus for maximum growth.'
  },
  {
    day: 'Saturday',
    title: 'Active Recovery',
    exercises: [],
    nutritionalFocus: 'Anti-inflammatory foods like salmon or turmeric.'
  },
  {
    day: 'Sunday',
    title: 'Rest Day',
    exercises: [],
    nutritionalFocus: 'Prepare meals for the upcoming week.'
  }
];

export const NUTRITION_ITEMS: NutritionItem[] = [
  {
    name: 'Eggs',
    benefit: 'High-quality protein and healthy fats for hormone production.',
    category: 'protein',
    icon: 'Egg'
  },
  {
    name: 'Chicken Breast',
    benefit: 'Lean protein source for muscle tissue repair.',
    category: 'protein',
    icon: 'Beef' // Using Beef icon as generic meat
  },
  {
    name: 'Oats',
    benefit: 'Slow-release carbohydrates for sustained energy.',
    category: 'carb',
    icon: 'Wheat'
  },
  {
    name: 'Greek Yogurt',
    benefit: 'Contains both fast and slow-digesting proteins (whey and casein).',
    category: 'protein',
    icon: 'Milk'
  },
  {
    name: 'Almonds',
    benefit: 'Loaded with Vitamin E and magnesium for recovery.',
    category: 'fat',
    icon: 'Nut'
  }
];

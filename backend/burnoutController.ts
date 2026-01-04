import { Request, Response } from 'express';
// Assuming a db client like 'pg' is configured
// import { db } from '../db';

/**
 * LOGIC SPECIFICATION:
 * StressScore = (ActiveTasks * 10) + (Sum of Priorities) - (Days until next deadline)
 * 
 * Thresholds:
 * < 30: Green (Healthy)
 * 30-50: Yellow (At Capacity)
 * > 50: Red (Burnout Risk)
 */

export const getBurnoutCheck = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;

  try {
    // 1. Fetch Active Tasks
    // const tasks = await db.query('SELECT * FROM tasks WHERE assigned_to_id = $1 AND status != $2', [userId, 'DONE']);
    const tasks: any[] = []; // Mock
    
    // 2. Calculate Variables
    const activeTasksCount = tasks.length;
    const sumPriorities = tasks.reduce((sum, task) => sum + task.priority, 0);
    
    // Calculate days until next deadline
    // Find closest deadline
    const now = new Date();
    let minDays = 30; // Default buffer
    tasks.forEach(t => {
      if (t.deadline) {
        const diffTime = new Date(t.deadline).getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays < minDays) minDays = diffDays;
      }
    });

    // 3. Formula
    // Logic: Closer deadline (smaller minDays) increases score (subtraction of small number).
    // Wait, the prompt formula is: (ActiveTasks * 10) + (Sum of Priorities) - (Days until next deadline)
    // If deadline is 1 day away: Score - 1. If 10 days away: Score - 10.
    // This implies imminent deadlines INCREASE stress less than far deadlines? 
    // CORRECTION based on standard logic: Usually (1/Days) or (Const - Days).
    // Sticking strictly to prompt: " - (Days until next deadline)".
    // Example: 5 tasks (50) + Priority 15 (65) - 2 days (63) = High Stress.
    // Example: 5 tasks (50) + Priority 15 (65) - 20 days (45) = Medium Stress.
    // The prompt logic holds up: Further deadlines reduce the stress score.

    const stressScore = (activeTasksCount * 10) + sumPriorities - minDays;

    return res.json({
      score: stressScore,
      status: stressScore > 50 ? 'RED' : stressScore > 30 ? 'YELLOW' : 'GREEN',
      metrics: { activeTasksCount, sumPriorities, minDays }
    });

  } catch (error) {
    return res.status(500).json({ message: 'Error calculating burnout score' });
  }
};

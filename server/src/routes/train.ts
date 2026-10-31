import { Request, Response } from 'express';
import Papa from 'papaparse';
import { z } from 'zod';
import { trainModels } from '../utils/ml';

const trainBodySchema = z.object({
  targetColumn: z.string().min(1, 'targetColumn is required'),
});

export function handleTrain(req: Request, res: Response): void {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No CSV file uploaded' });
      return;
    }

    const validation = trainBodySchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        error: 'Invalid input',
        details: validation.error.errors.map((e) => e.message),
      });
      return;
    }

    const { targetColumn } = validation.data;
    const csvContent = req.file.buffer.toString('utf-8');
    if (!csvContent.trim()) {
      res.status(400).json({ error: 'The uploaded file is empty' });
      return;
    }

    const parsed = Papa.parse<Record<string, string | null>>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
    });

    if (parsed.data.length === 0) {
      res.status(400).json({ error: 'CSV file contains no data rows' });
      return;
    }

    const result = trainModels(parsed.data, targetColumn);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error during training';
    res.status(500).json({ error: message });
  }
}

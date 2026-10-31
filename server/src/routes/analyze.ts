import { Request, Response } from 'express';
import Papa from 'papaparse';
import { analyzeDataset } from '../utils/analyze';

export function handleAnalyze(req: Request, res: Response): void {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No CSV file uploaded' });
      return;
    }

    const csvContent = req.file.buffer.toString('utf-8');
    if (!csvContent.trim()) {
      res.status(400).json({ error: 'The uploaded file is empty' });
      return;
    }

    const parsed = Papa.parse<Record<string, string | null>>(csvContent, {
      header: true,
      skipEmptyLines: 'greedy',
    });

    if (parsed.errors.length > 0 && parsed.data.length === 0) {
      res.status(400).json({
        error: 'Failed to parse CSV file',
        details: parsed.errors.map((e) => e.message),
      });
      return;
    }

    if (parsed.data.length === 0) {
      res.status(400).json({ error: 'CSV file contains no rows' });
      return;
    }

    const result = analyzeDataset(parsed.data);
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error during analysis';
    res.status(500).json({ error: message });
  }
}

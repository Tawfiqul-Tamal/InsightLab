import { app } from './app';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;

app.listen(PORT, () => {
  console.log(`🚀 InsightLab API server running at http://localhost:${PORT}`);
  console.log(`👉 Health check: http://localhost:${PORT}/api/health`);
});

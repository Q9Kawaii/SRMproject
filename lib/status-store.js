// In-memory status storage (in production, use Redis or similar)
const statusStore = new Map();

export function updateStatus(jobId, message, type = 'info') {
  if (!jobId) return;
  
  const existing = statusStore.get(jobId) || { status: '', history: [] };
  const newEntry = { message, type, timestamp: Date.now() };
  
  statusStore.set(jobId, {
    status: message,
    history: [...existing.history, newEntry]
  });
  
  // Clean up old entries after 5 minutes
  setTimeout(() => {
    statusStore.delete(jobId);
  }, 5 * 60 * 1000);
}

export function getStatus(jobId) {
  return statusStore.get(jobId) || { status: 'Processing...', history: [] };
}

export function clearStatus(jobId) {
  statusStore.delete(jobId);
}


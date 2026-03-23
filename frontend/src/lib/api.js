// File: api.js
// Purpose: Standardized fetch helper.
// Overview:
// - Adds timeout support
// - Optional retry logic
// File: api.js
// Purpose: Project module for Tesla ChatBot.

export const apiFetch = async (url, options = {}, { timeoutMs = 15000, retries = 1 } = {}) => {
  const attempt = async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  };

  let lastError;
  for (let i = 0; i <= retries; i += 1) {
    try {
      const response = await attempt();
      return response;
    } catch (err) {
      lastError = err;
      if (i === retries) throw err;
    }
  }

  throw lastError;
};





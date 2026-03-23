// File: constants.js
// Purpose: Shared frontend constants.
// Overview:
// - API base URL
// - Supported languages
// File: constants.js
// Purpose: Project module for Tesla ChatBot.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const LANGUAGES = [
  { code: "english", label: "English" },
  { code: "german", label: "German" },
];

export const DEFAULT_LANGUAGE = "english";





// API Base URL
export const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

// Likert scale labels
export const LIKERT_5_LABELS = {
  1: 'Rất không đồng ý',
  2: 'Không đồng ý',
  3: 'Trung lập',
  4: 'Đồng ý',
  5: 'Rất đồng ý',
};

export const LIKERT_7_LABELS = {
  1: 'Rất không đồng ý',
  2: 'Không đồng ý',
  3: 'Hơi không đồng ý',
  4: 'Trung lập',
  5: 'Hơi đồng ý',
  6: 'Đồng ý',
  7: 'Rất đồng ý',
};

// Routes
export const ROUTES = {
  LOGIN: '/login',
  SURVEY: '/survey',
  COMPLETE: '/complete',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SURVEYS: '/admin/surveys',
  ADMIN_REPORTS: '/admin/reports',
};

// Question types
export const QUESTION_TYPES = {
  LIKERT: 'likert',
  TEXT: 'text',
  MULTIPLE_CHOICE: 'multiple_choice',
};

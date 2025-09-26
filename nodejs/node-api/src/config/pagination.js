// config/pagination.js
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 25,
  MAX_PAGE_SIZE: 100,
};
export const clamp = (n, lo, hi) => Math.min(Math.max(n, lo), hi);

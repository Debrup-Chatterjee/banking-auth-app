export const isUserLoggedIn = () => !!localStorage.getItem('userEmail');

export const setUserSession = (email) =>
  localStorage.setItem('userEmail', email);

export const clearUserSession = () => localStorage.removeItem('userEmail');

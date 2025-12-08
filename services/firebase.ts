
// services/firebase.ts

// MOCK IMPLEMENTATION TO FIX COMPILATION ERRORS WHEN FIREBASE SDK IS NOT COMPATIBLE OR MISSING
// The original imports were causing "has no exported member" errors.

export interface User {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

// Mock state
let currentUser: User | null = null;
let authListener: ((user: User | null) => void) | null = null;

const notify = () => {
  if (authListener) authListener(currentUser);
};

// --- AUTH ACTIONS ---

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  console.log("Mock SignUp:", email);
  // Simulate network delay
  await new Promise(r => setTimeout(r, 800));
  
  const newUser = {
    uid: 'mock-user-' + Date.now(),
    email,
    displayName: name,
    photoURL: null
  };
  currentUser = newUser;
  notify();
  return { user: newUser };
};

export const loginWithEmail = async (email: string, pass: string) => {
  console.log("Mock Login:", email);
  await new Promise(r => setTimeout(r, 800));

  if (pass === 'error') throw new Error("Invalid password (mock)");

  const user = {
    uid: 'mock-user-login-' + Date.now(),
    email,
    displayName: email.split('@')[0],
    photoURL: null
  };
  currentUser = user;
  notify();
  return { user };
};

export const signInWithSocial = async (providerName: 'google' = 'google') => {
  console.log("Mock Social Login:", providerName);
  await new Promise(r => setTimeout(r, 800));

  const user = {
    uid: 'mock-google-user-' + Date.now(),
    email: 'demo@example.com',
    displayName: 'Demo User',
    photoURL: 'https://ui-avatars.com/api/?name=Demo+User&background=0D8ABC&color=fff'
  };
  currentUser = user;
  notify();
  return { user };
};

export const logout = async () => {
  console.log("Mock Logout");
  await new Promise(r => setTimeout(r, 500));
  currentUser = null;
  notify();
};

export const subscribeToAuth = (callback: (user: User | null) => void): (() => void) => {
    authListener = callback;
    // Immediate callback with current state
    callback(currentUser);
    return () => {
      if (authListener === callback) authListener = null;
    };
};

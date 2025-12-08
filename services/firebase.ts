
import firebase from "firebase/app";
import "firebase/auth";
import "firebase/analytics";

export type User = firebase.User;

// ------------------------------------------------------------------
// FIREBASE CONFIGURATION
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "AIzaSyASzk3cvy4gbvoEGoOuG4_kd5sTVcfjwUo",
  authDomain: "reframe-project.firebaseapp.com",
  projectId: "reframe-project",
  storageBucket: "reframe-project.firebasestorage.app",
  messagingSenderId: "173816368422",
  appId: "1:173816368422:web:8367ce4c6182f561b845e7",
  measurementId: "G-PE77TVYC0P"
};

// Initialize Firebase
let app: firebase.app.App | undefined;
let auth: firebase.auth.Auth | undefined;

try {
  // Check if apps already initialized
  if (!firebase.apps.length) {
    app = firebase.initializeApp(firebaseConfig);
  } else {
    app = firebase.app();
  }
  
  auth = firebase.auth();
  
  if (typeof window !== 'undefined') {
    firebase.analytics();
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
  console.warn("Running in Demo Mode due to initialization failure.");
}

// Providers
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Mock Login Helper (Fallback)
const mockLogin = () => {
  console.log("Performing mock login for demo...");
  return new Promise<{user: Partial<User>}>((resolve) => {
    setTimeout(() => {
      resolve({
        user: {
          uid: 'mock-user-123',
          displayName: 'Demo User',
          email: 'demo@reframe.app',
          photoURL: null
        } as any
      });
    }, 1000);
  });
};

// --- AUTH ACTIONS ---

export const signUpWithEmail = async (email: string, pass: string, name: string) => {
  if (!auth) return mockLogin();

  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, pass);
    // Update the user's display name
    if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: name
        });
    }
    return userCredential;
  } catch (error: any) {
    console.error("Sign Up Error:", error.code);
    if (error.code === 'auth/email-already-in-use') {
      throw new Error("User already exists. Sign in?");
    }
    throw new Error(error.message);
  }
};

export const loginWithEmail = async (email: string, pass: string) => {
  if (!auth) return mockLogin();

  try {
    const userCredential = await auth.signInWithEmailAndPassword(email, pass);
    return userCredential;
  } catch (error: any) {
    console.error("Login Error:", error.code);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
       throw new Error("Email or Password Incorrect");
    }
    throw new Error("Email or Password Incorrect");
  }
};

export const signInWithSocial = async (providerName: 'google' = 'google') => {
  if (!auth) {
    return mockLogin();
  }

  try {
    const result = await auth.signInWithPopup(googleProvider);
    return result;
  } catch (error: any) {
    console.error("Firebase Login Error:", error);

    // Fallback logic
    if (
      error.code === 'auth/unauthorized-domain' || 
      error.code === 'auth/api-key-not-valid' || 
      error.code === 'auth/operation-not-allowed'
    ) {
       if (error.code === 'auth/unauthorized-domain') {
         console.warn(`--------------------------------------------------------------------------------`);
         console.warn(`⚠️  FIREBASE DOMAIN UNAUTHORIZED`);
         console.warn(`👉  PLEASE ADD THIS DOMAIN TO YOUR FIREBASE CONSOLE:`);
         console.warn(`    ${window.location.hostname}`);
         console.warn(`--------------------------------------------------------------------------------`);
       }

       console.warn("Falling back to mock login because Firebase is not fully configured for this domain.");
       return mockLogin();
    }
    throw error;
  }
};

export const logout = async () => {
  if (auth) {
    await auth.signOut();
  }
};

// Helper to subscribe to auth changes without exposing the auth instance directly
export const subscribeToAuth = (callback: (user: User | null) => void): (() => void) => {
    if (!auth) {
        // If auth isn't initialized, immediately call back with null (or mock user if forced)
        callback(null);
        return () => {};
    }
    return auth.onAuthStateChanged(callback);
};

import * as firebaseApp from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  FacebookAuthProvider, 
  TwitterAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  User 
} from 'firebase/auth';

// ------------------------------------------------------------------
// INSTRUCTIONS:
// 1. Go to console.firebase.google.com and create a project.
// 2. Go to Project Settings -> General -> "Your apps" -> Web App.
// 3. Copy the "firebaseConfig" object and paste it below.
// 4. Go to Build -> Authentication -> Sign-in method.
// 5. Enable Google, Facebook, and Twitter (X).
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

// Initialize Firebase only if config is present to prevent crashes in demo mode
let auth: any;

try {
  // We check if keys are likely present (rudimentary check)
  if (Object.keys(firebaseConfig).length > 0) {
    const app = firebaseApp.initializeApp(firebaseConfig);
    auth = getAuth(app);
  } else {
    console.warn("Firebase Config is missing. Social logins will run in demo mode (mock).");
  }
} catch (e) {
  console.error("Firebase Initialization Error:", e);
}

// Providers
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const twitterProvider = new TwitterAuthProvider();

// Login Function
export const signInWithSocial = async (providerName: 'google' | 'facebook' | 'twitter') => {
  if (!auth) {
    // MOCK LOGIN FOR DEMO PURPOSES IF NO CONFIG
    console.log("Mocking login for demo...");
    return new Promise<any>((resolve) => {
      setTimeout(() => {
        resolve({
          user: {
            uid: 'mock-user-123',
            displayName: 'Demo User',
            email: 'demo@reframe.app',
            photoURL: null
          }
        });
      }, 1000);
    });
  }

  let provider;
  switch (providerName) {
    case 'google': provider = googleProvider; break;
    case 'facebook': provider = facebookProvider; break;
    case 'twitter': provider = twitterProvider; break;
    default: provider = googleProvider;
  }

  try {
    const result = await signInWithPopup(auth, provider);
    return result;
  } catch (error) {
    console.error("Login Failed:", error);
    throw error;
  }
};

export const logout = async () => {
  if (auth) {
    await firebaseSignOut(auth);
  }
};

export const getAuthInstance = () => auth;
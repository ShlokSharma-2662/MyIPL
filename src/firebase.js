import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCb-9Sz3j4sztlzM0f-q0cacuY0WcQ1wew",
  authDomain: "myipl-3f6ec.firebaseapp.com",
  projectId: "myipl-3f6ec",
  storageBucket: "myipl-3f6ec.firebasestorage.app",
  messagingSenderId: "304876003308",
  appId: "1:304876003308:web:91b25fe6da27bfe4792ac9",
  measurementId: "G-R36R594VNJ"
};

let app, analytics, auth, googleProvider;

try {
  app = initializeApp(firebaseConfig);
  analytics = getAnalytics(app);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
} catch (e) {
  console.error("Firebase initialization error:", e);
}

// Get or create a device ID to save independent sessions per browser
let localDeviceId = localStorage.getItem('ipl_sim_device_id');
if (!localDeviceId) {
  localDeviceId = 'device_' + Math.random().toString(36).substring(2, 15);
  localStorage.setItem('ipl_sim_device_id', localDeviceId);
}

export function getDeviceId() {
  if (auth && auth.currentUser) {
    return auth.currentUser.uid;
  }
  return localDeviceId;
}

export { analytics, auth };

// Returns the current user's Firebase ID token (a JWT) for authenticating
// requests to the .NET backend, or null when signed out. Pass it as
// `Authorization: Bearer <token>`. Firebase refreshes the token automatically.
export async function getIdToken() {
  if (!auth || !auth.currentUser) return null;
  try {
    return await auth.currentUser.getIdToken();
  } catch (error) {
    console.error("Failed to get ID token:", error);
    return null;
  }
}

export async function loginWithGoogle() {
  if (!auth) return;
  try {
    await signInWithPopup(auth, googleProvider);
    window.location.reload();
  } catch (error) {
    console.error("Login failed:", error);
  }
}

export async function logoutGoogle() {
  if (!auth) return;
  try {
    await signOut(auth);
    window.location.reload();
  } catch (error) {
    console.error("Logout failed:", error);
  }
}

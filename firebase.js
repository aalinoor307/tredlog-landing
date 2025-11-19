// firebase.js
// Firebase Auth + simple helpers for TredLog (GitHub Pages friendly)

// --- Import Firebase from CDN (no bundler needed) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- Your Firebase config (from Firebase console) ---
const firebaseConfig = {
  apiKey: "AIzaSyC0vRqaRc18mYi-NfSdfyRew29mr6XtiIcE",
  authDomain: "tredlog.firebaseapp.com",
  projectId: "tredlog",
  storageBucket: "tredlog.firebasestorage.app",
  messagingSenderId: "413349307810",
  appId: "1:413349307810:web:063f1aba63644dee65b98b",
  measurementId: "G-LRV7H7D9W"
};

// --- Init Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Helper to store a minimal user in localStorage (front-end routing only)
function storeUser(user) {
  const payload = {
    uid: user.uid,
    email: user.email,
    name: user.displayName,
    photoURL: user.photoURL
  };
  localStorage.setItem("tredlogUser", JSON.stringify(payload));
}

// --- Google sign-in (called from index.html) ---
async function loginWithGoogleInternal() {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;
  storeUser(user);
  // Go to dashboard
  window.location.href = "app.html";
}

// --- Email + password sign in / sign up ---
async function loginWithEmailInternal(email, password) {
  if (!email || !password) {
    throw new Error("Please enter both email and password.");
  }

  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    storeUser(result.user);
  } catch (err) {
    if (err.code === "auth/user-not-found") {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      storeUser(result.user);
    } else {
      throw err;
    }
  }

  window.location.href = "app.html";
}

// --- Logout helper (used from app.html) ---
async function logoutUserInternal() {
  await signOut(auth);
  localStorage.removeItem("tredlogUser");
  window.location.href = "index.html";
}

// --- Expose to the global window so normal <script> can call them ---
window.loginWithGoogle = async function () {
  try {
    await loginWithGoogleInternal();
  } catch (err) {
    console.error(err);
    alert("Google login failed: " + err.message);
  }
};

window.loginWithEmail = async function (email, password) {
  try {
    await loginWithEmailInternal(email, password);
  } catch (err) {
    console.error(err);
    alert("Email login failed: " + err.message);
  }
};

window.logoutUser = async function () {
  try {
    await logoutUserInternal();
  } catch (err) {
    console.error(err);
    alert("Logout failed: " + err.message);
  }
};

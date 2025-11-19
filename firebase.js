// firebase.js
// Final version for TredLog.com (GitHub Pages + Firebase Auth)

// Import Firebase from CDN (v10+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 1) YOUR FIREBASE CONFIG
//    Replace ONLY the object below with the one from
//    Firebase console → Project settings → Web app.
const firebaseConfig = {
  apiKey: "AIzaSyCOVqRaCi8mYi-Nf5dfyRewZ9mr6XtiicE",
  authDomain: "tredlog.firebaseapp.com",
  projectId: "tredlog",
  storageBucket: "tredlog.firebasestorage.app",
  messagingSenderId: "413340937810",
  appId: "1:413340937810:web:063f1aba63664dee65b98b",
  measurementId: "G-LRV7HT70YW"
};
// ✅ After you paste from Firebase console, there should be NO placeholder text left.
//    It must look exactly like the snippet from Firebase (same keys and values).

// 2) INIT FIREBASE
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// 3) GOOGLE SIGN-IN (used by the "Sign in with Google" button)
window.loginWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Store minimal info locally (used by the dashboard)
    localStorage.setItem("tredlogUser", JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL
    }));

    // Go to dashboard (app.html redirects to your real dashboard)
    window.location.href = "app.html";
  } catch (err) {
    console.error("Google login failed", err);
    alert("Google login failed: " + err.message);
  }
};

// 4) LOGOUT (you can call window.logoutUser() from the dashboard later)
window.logoutUser = async function () {
  try {
    await signOut(auth);
    localStorage.removeItem("tredlogUser");
    window.location.href = "index.html";
  } catch (err) {
    console.error("Logout error", err);
    alert("Logout failed: " + err.message);
  }
};

// 5) AI BOT FRONT-END HOOK
//    The homepage JS calls window.askBot(question).
//    For now this just shows a friendly message until you connect a real backend.
//    When you eventually deploy an API (Cloud Function, etc.), update ASK_ENDPOINT.

const ASK_ENDPOINT = ""; // e.g. "https://your-cloud-function-url/askTredlog"

window.askBot = async function (question) {
  // If no backend is configured, return a default message
  if (!ASK_ENDPOINT) {
    return "AI backend isn’t connected yet. Please connect an OpenAI/Firebase Function to ASK_ENDPOINT in firebase.js.";
  }

  try {
    const res = await fetch(ASK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question })
    });

    if (!res.ok) {
      throw new Error("Backend error: " + res.status);
    }

    const data = await res.json();
    return data.reply || "No reply from AI backend.";
  } catch (err) {
    console.error("askBot error", err);
    return "Could not reach the AI backend. Check ASK_ENDPOINT in firebase.js.";
  }
};

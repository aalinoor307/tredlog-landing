// firebase.js
// Using Firebase v10 CDN modules for GitHub Pages (no bundler needed)

// Import from Firebase CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// 🔑 Your Firebase config
// (Copy this object from the Firebase console: Project settings → General → "Your apps" → Web app)
const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "tredlog.firebaseapp.com",
  projectId: "tredlog",
  storageBucket: "tredlog.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Make functions visible to HTML (window = global browser object)
window.loginWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Store minimal info locally (just for front-end routing)
    localStorage.setItem("tredlogUser", JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL
    }));

    // Go to dashboard page
    window.location.href = "app.html";
  } catch (err) {
    console.error("Google login error", err);
    alert("Google login failed: " + err.message);
  }
};

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

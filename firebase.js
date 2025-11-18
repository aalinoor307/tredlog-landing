// firebase.js
// Firebase v10 CDN modules (perfect for GitHub Pages)

// Import Firebase core + Auth from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your Firebase configuration
const firebaseConfig = {
  const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY_HERE",
  authDomain: "tredlog.firebaseapp.com",
  projectId: "tredlog",
  storageBucket: "tredlog.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

// Make login function available to HTML
window.loginWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Save minimal user info to localStorage
    localStorage.setItem("tredlogUser", JSON.stringify({
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL
    }));

    // Redirect to dashboard
    window.location.href = "app.html";
  } catch (err) {
    console.error("Google Login Error:", err);
    alert("Login failed: " + err.message);
  }
};

// Logout helper
window.logoutUser = async function () {
  try {
    await signOut(auth);
    localStorage.removeItem("tredlogUser");
    window.location.href = "index.html";
  } catch (err) {
    console.error("Logout error:", err);
    alert("Logout failed: " + err.message);
  }
};

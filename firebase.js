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
  apiKey: "AIzaSyCvoqRacI8nYl-Nf5dfyRew29mGXtiilc",
  authDomain: "tredlog.firebaseapp.com",
  projectId: "tredlog",
  storageBucket: "tredlog.firebasestorage.app",
  messagingSenderId: "413349387810",
  appId: "1:413349387810:web:063f1ba0e36644dee0589b",
  measurementId: "G-LRV7H7TQW"
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

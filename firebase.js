// firebase.js
// TredLog Firebase Auth + simple bot stub, using CDN modules

// --- Firebase CDN imports ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

//
// IMPORTANT: this is the real config for your "tredlog" Firebase project
// (copied from your screenshot)
//
const firebaseConfig = {
  apiKey: "AIzaSyC0VQRaCi8mY1-Nf5dfyRew29mr6XtiicE",
  authDomain: "tredlog.firebaseapp.com",
  projectId: "tredlog",
  storageBucket: "tredlog.firebasestorage.app",
  messagingSenderId: "413349037810",
  appId: "1:413349037810:web:063f1aba63644dee65b98b",
  measurementId: "G-LRVT7H70YW"
};

// --- Init Firebase + Auth ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Small helper to save a “session” in the browser
function setLocalUser(info) {
  localStorage.setItem("tredlogUser", JSON.stringify(info));
}

// Called by the big “Sign in & open dashboard” button
window.launchDashboard = () => {
  const raw = localStorage.getItem("tredlogUser");
  if (raw) {
    // already signed in, just go to the dashboard
    window.location.href = "app.html";
  } else {
    // scroll to sign-in card
    const card = document.getElementById("signin-card");
    if (card) card.scrollIntoView({ behavior: "smooth" });
  }
};

// --- Google sign-in ---
window.loginWithGoogle = async function () {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    setLocalUser({
      provider: "google",
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      photoURL: user.photoURL || null
    });

    window.location.href = "app.html";
  } catch (err) {
    console.error("Google login error", err);
    alert("Google login failed: " + err.message);
  }
};

// --- Email “login” (front-end only, no real password auth yet) ---
window.handleEmailLogin = function () {
  const emailInput = document.getElementById("emailInput");
  const pwdInput = document.getElementById("passwordInput");

  const email = (emailInput?.value || "").trim();
  if (!email) {
    emailInput?.focus();
    alert("Please enter an email.");
    return;
  }

  // NOTE: this is not real Firebase email/password auth.
  // It just remembers the email locally and opens the dashboard.
  setLocalUser({
    provider: "email-demo",
    email,
    maskedPassword: pwdInput?.value ? "set" : "empty"
  });

  window.location.href = "app.html";
};

// --- Logout helper (if you add a logout button in the dashboard) ---
window.logoutUser = async function () {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Sign-out error", err);
  } finally {
    localStorage.removeItem("tredlogUser");
    window.location.href = "index.html";
  }
};

// --- Very simple built-in “AI” bot stub ---
// This makes the chat box respond so the UI feels alive.
// Real OpenAI integration needs a secure backend (cannot safely put API key in browser).
async function askBot(question) {
  const q = question.toLowerCase();

  if (!q || q.length < 5) {
    return "Tell me a bit more about your setup or problem, and I’ll try to help.";
  }

  if (q.includes("journal") || q.includes("log")) {
    return "Use the journal to log every trade: date, pair, direction, setup, R planned, R realized, and a short comment on what you did well and what you can improve.";
  }

  if (q.includes("discipline") || q.includes("rules")) {
    return "Your discipline score comes from the weighted checklist. Aim to tick the rules that truly define a clean setup. The idea is: more rules met = higher probability, not more trades.";
  }

  if (q.includes("probability") || q.includes("edge")) {
    return "Think in R and probabilities. Each logged trade gives you data. Over a sample of trades, you’ll see which setups have the highest win rate and best average R, and which ‘emotional’ trades hurt your equity curve.";
  }

  if (q.includes("calendar") || q.includes("exports")) {
    return "The calendar shows daily PnL and trade count. Use CSV/JSON exports regularly to back up your data and do deeper analysis in spreadsheets or Python.";
  }

  return "I’m a built-in TredLog assistant. I’m not a full OpenAI bot yet, but I can explain how to use the journal, discipline score, and dashboard so you can trade more systematically.";
}

// Expose chat handler for the landing page
window.askTredlog = async function () {
  const box = document.getElementById("botQuestion");
  const out = document.getElementById("botAnswer");
  const question = (box?.value || "").trim();

  if (!out) return;

  if (!question) {
    out.textContent = "Type a question first.";
    return;
  }

  out.textContent = "Thinking...";
  try {
    const reply = await askBot(question);
    out.textContent = reply;
  } catch (err) {
    console.error(err);
    out.innerHTML =
      "<span class='error-text'>Could not reach your AI backend. For now, I’m using the built-in TredLog helper.</span>";
  }
};

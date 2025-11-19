// firebase.js
// Shared Firebase auth + AI bot logic for TredLog landing + dashboard.

// --- Firebase CDN imports (no bundler needed) ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// --- Your Firebase config (from Firebase console) ---
const firebaseConfig = {
  apiKey: "AIzaSyC0vRqAc18mYl-Nf5dfyRew29mr6Xti1cE",
  authDomain: "tredlog.firebaseapp.com",
  projectId: "tredlog",
  storageBucket: "tredlog.firebasestorage.app",
  messagingSenderId: "413349073810",
  appId: "1:413349073810:web:063f1aba63644dee65b98b",
  measurementId: "G-LRVB7H7QVW"
};

// --- Init Firebase ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// --- Helper: local storage user snapshot ---
function saveUser(user) {
  const minimal = {
    uid: user.uid,
    email: user.email || null,
    name: user.displayName || null,
    photoURL: user.photoURL || null
  };
  localStorage.setItem("tredlogUser", JSON.stringify(minimal));
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("tredlogUser") || "null");
  } catch {
    return null;
  }
}

// --- DOM helpers (landing page) ---
function getDomRefs() {
  return {
    emailInput: document.getElementById("emailInput"),
    passwordInput: document.getElementById("passwordInput"),
    signinCard: document.getElementById("signinCard"),
    questionInput: document.getElementById("botQuestion"),
    answerBox: document.getElementById("botAnswer"),
    sendButton: document.getElementById("botSendButton")
  };
}

// --- 1. CTA: "Sign in & open dashboard" ---
window.handleLaunchClick = function () {
  const { signinCard } = getDomRefs();
  const user = auth.currentUser || getStoredUser();

  // If already logged in, go straight to dashboard
  if (user) {
    window.location.href = "app.html";
    return;
  }

  // Otherwise scroll to sign-in card
  if (signinCard) {
    signinCard.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

// --- 2. Google sign-in ---
window.handleGoogleLogin = async function () {
  const { signinCard } = getDomRefs();
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    saveUser(user);
    window.location.href = "app.html";
  } catch (err) {
    console.error("Google login error", err);
    alert("Google login failed: " + (err.message || err.code || "Unknown error"));
    if (signinCard) signinCard.scrollIntoView({ behavior: "smooth" });
  }
};

// --- 3. Email sign-in (creates account if not found) ---
window.handleEmailLogin = async function () {
  const { emailInput, passwordInput } = getDomRefs();
  if (!emailInput || !passwordInput) return;

  const email = (emailInput.value || "").trim();
  const password = (passwordInput.value || "").trim();

  if (!email || !password) {
    alert("Please enter both email and password.");
    return;
  }

  try {
    let cred;
    try {
      // Try to sign in
      cred = await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      // If user does not exist, create it
      if (err.code === "auth/user-not-found") {
        cred = await createUserWithEmailAndPassword(auth, email, password);
      } else {
        throw err;
      }
    }

    saveUser(cred.user);
    window.location.href = "app.html";
  } catch (err) {
    console.error("Email login error", err);
    alert("Email login failed: " + (err.message || err.code || "Unknown error"));
  }
};

// --- 4. Logout (for dashboard) ---
window.logoutUser = async function () {
  try {
    await signOut(auth);
  } catch (err) {
    console.error("Logout error", err);
  } finally {
    localStorage.removeItem("tredlogUser");
    window.location.href = "index.html";
  }
};

// --- 5. Gate dashboard (app.html) behind auth ---
window.requireAuthOnApp = function () {
  const stored = getStoredUser();
  // Quick check – if we don't even have a local snapshot, bounce immediately
  if (!stored) {
    window.location.href = "index.html";
    return;
  }

  // Also listen to real Firebase auth state
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      // If Firebase session is gone, kick back to landing
      window.location.href = "index.html";
    }
  });
};

// --- 6. AI assistant wiring ---

// Replace this with your real Cloud Function / API endpoint.
const ASK_ENDPOINT = "https://YOUR_CLOUD_FUNCTION_URL_HERE";

/**
 * Low-level call to your AI backend.
 * The backend should accept POST { question, uid } and respond with { reply }.
 */
async function askBot(question) {
  if (!ASK_ENDPOINT || ASK_ENDPOINT.includes("YOUR_CLOUD_FUNCTION_URL_HERE")) {
    // Safe fallback text so the UI doesn't look broken.
    return "AI backend is not connected yet. Ask your developer to set ASK_ENDPOINT in firebase.js.";
  }

  const body = {
    question,
    uid: (auth.currentUser && auth.currentUser.uid) || (getStoredUser() && getStoredUser().uid) || null
  };

  const res = await fetch(ASK_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    throw new Error("Backend error: " + res.status);
  }

  const data = await res.json().catch(() => ({}));
  return data.reply || "The AI backend responded, but I couldn't find a reply field.";
}

// Exposed to the landing page "Send" button
window.askTredlog = async function () {
  const { questionInput, answerBox, sendButton } = getDomRefs();
  if (!questionInput || !answerBox) return;

  const question = (questionInput.value || "").trim();
  if (!question) {
    answerBox.textContent = "Type a question first.";
    questionInput.focus();
    return;
  }

  answerBox.textContent = "Thinking...";
  if (sendButton) sendButton.disabled = true;

  try {
    const reply = await askBot(question);
    answerBox.textContent = reply;
  } catch (err) {
    console.error("AI error", err);
    answerBox.innerHTML =
      '<span class="error-text">Could not reach your AI backend. Make sure ASK_ENDPOINT in firebase.js points to your server.</span>';
  } finally {
    if (sendButton) sendButton.disabled = false;
  }
};

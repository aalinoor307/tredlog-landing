// ---------- Firebase INITIALIZATION ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Your Firebase config (copied from console)
const firebaseConfig = {
  apiKey: "AIzaSyC0vRac18mY1-NfSdFyRew29mr6XtiicE",
  authDomain: "tredlog.firebaseapp.com",
  projectId: "tredlog",
  storageBucket: "tredlog.firebasestorage.app",
  messagingSenderId: "413439073810",
  appId: "1:413439073810:web:063f1aba63644dee65b98b",
  measurementId: "G-LRVB77H7QV"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ---------- Google Sign-in ----------
export async function signInGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    localStorage.setItem("user", JSON.stringify(result.user));
    window.location.href = "app.html";  // Go to dashboard
  } catch (err) {
    alert("Login error: " + err.message);
  }
}

// ---------- Email Login (front-end only for now) ----------
export function fakeEmailLogin(email) {
  localStorage.setItem("user", JSON.stringify({ email }));
  window.location.href = "app.html";
}

// ---------- Logout ----------
export function logout() {
  signOut(auth);
  localStorage.removeItem("user");
  window.location.href = "index.html";
}

// ---------- OpenAI Bot ----------
export async function askBot(question) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer YOUR_OPENAI_API_KEY"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are TredLog AI assistant. Help with trading journal, discipline scoring, setups, etc." },
        { role: "user", content: question }
      ]
    })
  });

  const data = await res.json();
  return data.choices[0].message.content;
}

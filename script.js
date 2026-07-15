import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyC9tZ-oD8BFR3HVnfO32VB5BRBvqZ9TOLw",
  authDomain: "chat-ai-plus-fb9bb.firebaseapp.com",
  projectId: "chat-ai-plus-fb9bb",
  storageBucket: "chat-ai-plus-fb9bb.firebasestorage.app",
  messagingSenderId: "751188614233",
  appId: "1:751188614233:web:1d164bf099eaacf589e548",
  measurementId: "G-VPSVBCTNTB",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const authForm = document.getElementById("auth-form");
const socialBtns = document.querySelectorAll(".btn-social");
const googleBtn = socialBtns[0];
const appleBtn = socialBtns[1];
const eyeToggle = document.getElementById("eye-toggle");
const passwordInput = document.getElementById("login-pass");

function handleAuthError(error) {
  console.error("Xəta:", error.code);
  alert("Xəta baş verdi: " + error.message);
}

if (authForm) {
  authForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = authForm.querySelector('input[type="email"]').value;
    const password = passwordInput.value;
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      localStorage.setItem("userName", email.split('@')[0]);
      localStorage.setItem("userImg", "./profile-default.webp");
      alert("Email ilə qeydiyyat uğurludur!");
      window.location.href = "./chat.html";
    } catch (error) {
      handleAuthError(error);
    }
  });
}

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem("userName", result.user.displayName || "İstifadəçi");
      if (result.user.photoURL) {
        localStorage.setItem("userImg", result.user.photoURL);
      } else {
        localStorage.setItem("userImg", "./profile-default.webp");
      }
      alert(`Xoş gəldiniz, ${result.user.displayName || "İstifadəçi"}`);
      window.location.href = "./chat.html";
    } catch (error) {
      handleAuthError(error);
    }
  });
}

if (appleBtn) {
  appleBtn.addEventListener("click", async () => {
    const provider = new OAuthProvider("apple.com");
    try {
      const result = await signInWithPopup(auth, provider);
      localStorage.setItem("userName", result.user.displayName || "İstifadəçi");
      localStorage.setItem("userImg", "./profile-default.webp");
      alert(`Xoş gəldiniz, ${result.user.displayName || "İstifadəçi"}`);
      window.location.href = "./chat.html";
    } catch (error) {
      handleAuthError(error);
    }
  });
}

if (eyeToggle && passwordInput) {
  eyeToggle.addEventListener("click", () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    eyeToggle.classList.toggle("fa-eye");
    eyeToggle.classList.toggle("fa-eye-slash");
  });
}

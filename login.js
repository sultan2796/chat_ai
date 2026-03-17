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

// DOM hissəsi
const authForm = document.getElementById("auth-form");
const socialBtns = document.querySelectorAll(".btn-social");
const googleBtn = socialBtns[0];
const appleBtn = socialBtns[1];
const eyeToggle = document.getElementById("eye-toggle");
const passwordInput = document.getElementById("login-pass");

const chatInput = document.getElementById("chat-input-field");
const sendBtn = document.getElementById("send-msg-btn");
const botMainText = document.getElementById("bot-main-text");
const userDisplayMsg = document.getElementById("user-display-msg");
const copyBtn = document.getElementById("copy-btn");
const speakBtn = document.getElementById('speak-btn');


function typeWriter(text, element) {
  element.textContent = ""; 
  let i = 0;
  if (element.typerInterval) clearInterval(element.typerInterval);
  
  element.typerInterval = setInterval(() => {
    if (i < text.length) {
      element.textContent += text.charAt(i);
      i++;
    } else {
      clearInterval(element.typerInterval);
    }
  }, 30);
}

function handleSendMessage() {
  if (!chatInput) return;
  const msg = chatInput.value.trim();

  if (msg === "") return;
  if (userDisplayMsg) userDisplayMsg.textContent = msg;
  chatInput.value = "";
  if (botMainText) botMainText.textContent = "Düşünürəm...";

  setTimeout(() => {
    const aiResponse = `Sənin "${msg}" sualın üzərində işləyirəm. Bu mövzuda CHAT A.I+ sənə ən dəqiq məlumatları təqdim edir!`;
    if (botMainText) typeWriter(aiResponse, botMainText);
  }, 1000);
}

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
      alert("Email ilə qeydiyyat uğurludur!");
      window.location.href = "chat.html";
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
      alert(`Xoş gəldiniz, ${result.user.displayName}`);
      window.location.href = "chat.html";
    } catch (error) {
      handleAuthError(error);
    }
  });
}

// goz isaresini gizletme hisesi
if (eyeToggle && passwordInput) {
  eyeToggle.addEventListener("click", () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    eyeToggle.classList.toggle("fa-eye");
    eyeToggle.classList.toggle("fa-eye-slash");
  });
}

if (sendBtn) {
  sendBtn.addEventListener("click", handleSendMessage);
}

if (chatInput) {
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") handleSendMessage();
  });
}

if (copyBtn) {
  copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(botMainText.textContent);
    alert("Mətn kopyalandı!");
  });
}

if (speakBtn) {
  speakBtn.addEventListener('click', () => {
    const utterance = new SpeechSynthesisUtterance(botMainText.textContent);
    utterance.lang = 'tr-TR'; 
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

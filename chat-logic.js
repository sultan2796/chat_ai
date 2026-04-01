document.addEventListener("DOMContentLoaded", () => {
  
  const inputField = document.querySelector(".input-wrapper input") || document.getElementById('chat-input-field');
  const sendBtn = document.querySelector(".send-btn") || document.getElementById('send-msg-btn');
  const chatMain = document.querySelector(".chat-main");
  const welcomeSection = document.querySelector(".welcome-section");
  const welcomeTitle = welcomeSection ? welcomeSection.querySelector("h1") : null;
  const logo = document.querySelector(".sidebar-header h2") || document.querySelector(".logo");
  const historyList = document.getElementById("history-list");
  const themeToggle = document.getElementById("theme-toggle");
  const clearAllBtn = document.querySelector(".clear-all");
  const newChatBtn = document.querySelector(".new-chat-btn");
  const searchBtn = document.querySelector(".fa-search")?.parentElement || document.querySelector(".search-btn");

  function setupCardClick() {
    const cards = document.querySelectorAll(".example-card, .info-card");
    cards.forEach(card => {
      card.style.cursor = "pointer";
      card.onclick = () => {
        const cardText = card.querySelector("p")?.textContent;
        if (cardText && inputField) {
          inputField.value = cardText;
          inputField.focus();
        }
      };
    });
  }

  function applyTheme(mode) {
    if (!themeToggle) return;
    const icon = themeToggle.querySelector("i");
    const sidebar = document.querySelector(".sidebar");
    themeToggle.style.cssText = "background: transparent; border: none; outline: none; cursor: pointer; display: flex; align-items: center; justify-content: center; padding: 0;";

    if (mode === "dark-mode") {
      document.body.classList.add("dark-mode");
      document.body.style.backgroundColor = "#000000";
      if (chatMain) chatMain.style.backgroundColor = "transparent"; 
      if (sidebar) sidebar.style.backgroundColor = "#0a0a0a";
      if (welcomeTitle) welcomeTitle.style.color = "#ffffff";
      if (logo) logo.style.color = "#ffffff";
      icon.className = "fas fa-sun";
      icon.style.color = "#ffbd39";
      localStorage.setItem("theme", "dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
      document.body.style.backgroundColor = "#f8f9fb";
      if (chatMain) chatMain.style.backgroundColor = "transparent";
      if (sidebar) sidebar.style.backgroundColor = "#ffffff";
      if (welcomeTitle) welcomeTitle.style.color = "";
      if (logo) logo.style.color = "";
      icon.className = "fas fa-moon";
      icon.style.color = "#5865f2";
      localStorage.setItem("theme", "light-mode");
    }
  }

  function appendMessage(role, text, shouldSave = true) {
    if (welcomeSection) {
      welcomeSection.style.display = 'none';
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = `message-bubble ${role}`;
    
    const isDark = document.body.classList.contains("dark-mode");
    msgDiv.style.cssText = `
        max-width: 70%;
        margin-bottom: 20px;
        padding: 15px 20px;
        border-radius: 20px;
        font-size: 15px;
        line-height: 1.5;
        position: relative;
        z-index: 10; /* Mesajların animasiyadan öndə olması üçün */
        animation: fadeIn 0.3s ease;
        ${role === 'user' 
            ? 'align-self: flex-end; background: #5865f2; color: white; margin-left: auto; border-bottom-right-radius: 5px;' 
            : `align-self: flex-start; background: ${isDark ? '#1a1a1a' : 'white'}; color: ${isDark ? '#eee' : '#333'}; border-bottom-left-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);`}
    `;

    msgDiv.textContent = text;

    let msgContainer = document.getElementById('chat-display-area');
    if (!msgContainer) {
      msgContainer = document.createElement('div');
      msgContainer.id = 'chat-display-area';
      
      msgContainer.style.cssText = `
        display: flex; 
        flex-direction: column; 
        width: 100%; 
        max-width: 800px; 
        margin: 0 auto; 
        overflow-y: auto; 
        padding: 20px; 
        flex: 1; 
        height: auto;
        position: relative;
        z-index: 5;
      `;
      
      chatMain.style.display = "flex";
      chatMain.style.flexDirection = "column";
      chatMain.style.height = "100vh";
      chatMain.style.position = "relative";
      chatMain.style.zIndex = "1";

      chatMain.insertBefore(msgContainer, document.querySelector('.input-area'));
    }

    msgContainer.appendChild(msgDiv);
    msgContainer.scrollTop = msgContainer.scrollHeight;

    if (shouldSave) saveChat();
  }

  function handleSend() {
    const text = inputField.value.trim();
    if (text === "") return;

    appendMessage('user', text);
    addHistoryUI(text);
    inputField.value = "";

    setTimeout(() => {
      const responses = [
        "Bununla bağlı sənə kömək edə bilərəm!",
        "Maraqlı sualdır, bir az araşdırım...",
        "CHAT A.I+ sistemimiz hazırda bu mövzuda məlumat toplayır.",
        "Əlbəttə, buyurun təfərrüatları qeyd edin."
      ];
      const randomResp = responses[Math.floor(Math.random() * responses.length)];
      appendMessage('bot', randomResp);
    }, 1000);
  }

  function addHistoryUI(text, shouldSave = true) {
    if (!historyList) return;
    const li = document.createElement("li");
    li.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 10px; cursor: pointer; border-radius: 8px; transition: 0.2s;";
    const leftBox = document.createElement("div");
    leftBox.style.cssText = "display: flex; align-items: center; gap: 10px; overflow: hidden;";
    const icon = document.createElement("i");
    icon.className = "far fa-comment";
    const span = document.createElement("span");
    span.className = "hist-text-content";
    span.textContent = text.length > 20 ? text.substring(0, 20) + "..." : text;
    leftBox.appendChild(icon);
    leftBox.appendChild(span);
    const deleteBtn = document.createElement("i");
    deleteBtn.className = "fas fa-times";
    deleteBtn.style.cssText = "padding: 5px; color: #888; cursor: pointer; font-size: 12px;";
    deleteBtn.onclick = (e) => { e.stopPropagation(); li.remove(); saveHistory(); };
    li.appendChild(leftBox);
    li.appendChild(deleteBtn);
    historyList.prepend(li);
    if (shouldSave) saveHistory();
  }

  function saveChat() {
    const messages = [];
    const container = document.getElementById('chat-display-area');
    if (container) {
      container.querySelectorAll(".message-bubble").forEach((msg) => {
        messages.push({ role: msg.classList.contains('user') ? 'user' : 'bot', text: msg.textContent });
      });
      localStorage.setItem("chat_messages", JSON.stringify(messages));
    }
  }

  function saveHistory() {
    if (!historyList) return;
    const items = [];
    historyList.querySelectorAll("li").forEach((li) => {
      const span = li.querySelector(".hist-text-content");
      if (span) items.push(span.textContent);
    });
    localStorage.setItem("chat_history", JSON.stringify(items));
  }

  if (sendBtn) sendBtn.addEventListener('click', handleSend);
  if (inputField) inputField.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSend(); });
  if (themeToggle) themeToggle.onclick = () => applyTheme(document.body.classList.contains("dark-mode") ? "light-mode" : "dark-mode");

  if (newChatBtn) {
    newChatBtn.onclick = () => {
      if (confirm("Yeni çat başlasın?")) {
        const container = document.getElementById('chat-display-area');
        if (container) {
          container.textContent = ""; 
        }
        if (welcomeSection) {
          welcomeSection.style.display = "block";
        }
        inputField.value = "";
        localStorage.removeItem("chat_messages");
      }
    };
  }

  if (clearAllBtn) {
    clearAllBtn.onclick = () => {
      if (confirm("Tarixçə təmizlənsin?")) {
        if (historyList) historyList.textContent = ""; 
        localStorage.removeItem("chat_history");
      }
    };
  }

  if (searchBtn && historyList) {
    searchBtn.addEventListener("click", () => {
      const existingSearch = document.getElementById("history-search-input");
      if (existingSearch) {
        existingSearch.remove();
        historyList.querySelectorAll("li").forEach((li) => (li.style.display = "flex"));
        return;
      }
      const searchInput = document.createElement("input");
      searchInput.id = "history-search-input";
      searchInput.placeholder = "Axtar...";
      searchInput.style.cssText = "width: 90%; margin: 10px auto; padding: 8px; border-radius: 5px; border: 1px solid #ccc; font-size: 12px; display: block;";
      historyList.parentNode.insertBefore(searchInput, historyList);
      searchInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        historyList.querySelectorAll("li").forEach((li) => {
          li.style.display = li.textContent.toLowerCase().includes(term) ? "flex" : "none";
        });
      });
    });
  }

  applyTheme(localStorage.getItem("theme") || "light-mode");
  setupCardClick(); 
  
  const savedMsgs = JSON.parse(localStorage.getItem("chat_messages") || "[]");
  if (savedMsgs.length > 0) {
    savedMsgs.forEach((m) => appendMessage(m.role, m.text, false));
  }
  const savedHist = JSON.parse(localStorage.getItem("chat_history") || "[]");
  if (savedHist.length > 0 && historyList) {
    savedHist.reverse().forEach((h) => addHistoryUI(h, false));
  }
});
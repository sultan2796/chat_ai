document.addEventListener("DOMContentLoaded", () => {
  
  if (typeof marked !== 'undefined') {
    const renderer = new marked.Renderer();
    renderer.code = function(code, language) {
      const lang = language || 'text';
      const langUpper = lang.toUpperCase();
      const safeCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `
        <div class="code-block-wrapper">
          <div class="code-block-header">
            <div class="code-lang">
              <i class="far fa-file-code"></i>
              <span>${langUpper}</span>
            </div>
            <div class="code-actions">
              <i class="fas fa-code"></i>
              <i class="fas fa-play" onclick="runCode(this, \`${encodeURIComponent(code)}\`, '${lang}')" title="Kodu İcra Et"></i>
              <i class="far fa-copy" onclick="copyToClipboard(this, \`${encodeURIComponent(code)}\`)" title="Kopyala"></i>
            </div>
          </div>
          <pre><code class="language-${lang}">${safeCode}</code></pre>
        </div>
      `;
    };
    marked.use({ renderer });
  }

  window.copyToClipboard = function(btn, encodedCode) {
    const code = decodeURIComponent(encodedCode);
    navigator.clipboard.writeText(code).then(() => {
      btn.className = "fas fa-check";
      setTimeout(() => {
        btn.className = "far fa-copy";
      }, 2000);
    });
  };

  window.runCode = function(btn, encodedCode, lang) {
    const code = decodeURIComponent(encodedCode);
    const language = lang.toLowerCase();
    
    if (language === 'html') {
      const newWin = window.open("", "_blank");
      if (newWin) {
        newWin.document.open();
        newWin.document.write(code);
        newWin.document.close();
      } else {
        alert("Pop-up pəncərələrinə icazə verilməyib. Zəhmət olmasa brauzer ayarlarından icazə verin.");
      }
    } else if (language === 'javascript' || language === 'js' || language === 'text') {
      const wrapper = btn.closest('.code-block-wrapper');

      const langKeywords = /^\s*(javascript|js|python|css|html|text|bash|shell|sql|java|cpp|c|typescript|ts|php|ruby|go|rust|swift|kotlin)\s*$/i;
      const cleanCode = code.split('\n').filter(line => !langKeywords.test(line.trim())).join('\n').trim();

      let sandbox = wrapper.querySelector('.code-sandbox');
      if (sandbox) sandbox.remove();

      const usesDom = /document\.|window\.|getElementById|querySelector|addEventListener/.test(cleanCode);

      if (usesDom) {
        const newWin = window.open("", "_blank");
        if (newWin) {
          newWin.document.open();
          newWin.document.write(`<!DOCTYPE html><html><body><script>\n${cleanCode}\n<\/script></body></html>`);
          newWin.document.close();
        } else {
          alert("Pop-up pəncərələrinə icazə verin.");
        }
      } else {
        let outputDiv = wrapper.querySelector('.code-output');
        if (!outputDiv) {
          outputDiv = document.createElement('div');
          outputDiv.className = 'code-output';
          outputDiv.style.cssText = 'background: #000; color: #00ff00; padding: 10px 15px; font-family: monospace; font-size: 13px; border-top: 1px solid #333; max-height: 200px; overflow-y: auto; border-radius: 0 0 12px 12px;';
          wrapper.appendChild(outputDiv);
        }
        outputDiv.innerHTML = '<div style="color: #888; margin-bottom: 5px;">-- İcra Nəticəsi --</div>';

        const originalLog = console.log;
        const originalWarn = console.warn;
        const originalError = console.error;

        const logToDiv = (color, ...args) => {
          const msg = args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ');
          const line = document.createElement('div');
          line.style.color = color;
          line.textContent = msg;
          outputDiv.appendChild(line);
        };

        console.log = (...args) => { logToDiv('#00ff00', ...args); originalLog.apply(console, args); };
        console.warn = (...args) => { logToDiv('#ffcc00', ...args); originalWarn.apply(console, args); };
        console.error = (...args) => { logToDiv('#ff4d4d', ...args); originalError.apply(console, args); };

        try {
          const result = eval(cleanCode);
          if (result !== undefined) {
            logToDiv('#aaa', '→ ' + (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result)));
          }
        } catch (err) {
          logToDiv('#ff4d4d', 'Xəta: ' + err.message);
        }

        console.log = originalLog;
        console.warn = originalWarn;
        console.error = originalError;
      }
    } else {
      alert("Bu dil üçün icra (Play) xüsusiyyəti hələ dəstəklənmir. (Yalnız HTML və ya JS üçün aktivdir)");
    }
  };

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

  const userNameEl = document.getElementById("user-name");
  const userImgEl = document.getElementById("user-img");
  const storedName = localStorage.getItem("userName");
  const storedImg = localStorage.getItem("userImg");
  
  if (userNameEl && storedName) {
    userNameEl.textContent = storedName;
  }
  if (userImgEl && storedImg) {
    userImgEl.src = storedImg;
  }

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

  function appendMessage(role, text, shouldSave = true, id = null) {
    if (welcomeSection) {
      welcomeSection.style.display = 'none';
    }

    const msgDiv = document.createElement('div');
    msgDiv.className = `message-bubble ${role}`;
    if (id) msgDiv.id = id;
    
    const isDark = document.body.classList.contains("dark-mode");
    msgDiv.style.cssText = `
        max-width: 70%;
        margin-bottom: 20px;
        padding: 15px 20px;
        border-radius: 20px;
        font-size: 15px;
        line-height: 1.5;
        position: relative;
        z-index: 10;
        animation: fadeIn 0.3s ease;
        ${role === 'user' 
            ? 'align-self: flex-end; background: #5865f2; color: white; margin-left: auto; border-bottom-right-radius: 5px; white-space: pre-wrap;' 
            : `align-self: flex-start; background: ${isDark ? '#1a1a1a' : 'white'}; color: ${isDark ? '#eee' : '#333'}; border-bottom-left-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);`}
    `;

    if (role === 'bot') {
      if (typeof marked !== 'undefined') {
        try {
          msgDiv.innerHTML = marked.parse(text);
        } catch (e) {
          console.error("Markdown xətası:", e);
          msgDiv.style.whiteSpace = "pre-wrap";
          msgDiv.textContent = text;
        }
      } else {
        console.error("Marked yüklənməyib.");
        msgDiv.style.whiteSpace = "pre-wrap";
        msgDiv.textContent = text;
      }
    } else {
      msgDiv.textContent = text;
    }
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

    if (role === 'bot' && typeof hljs !== 'undefined') {
      msgDiv.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
      });
    }

    if (shouldSave) saveChat();
  }

  const conversationHistory = [];

  function getApiKey() {
    return localStorage.getItem("geminiApiKey") || "";
  }

  async function callGeminiAPI(userText, retryCount = 0) {
    const apiKey = getApiKey();
    conversationHistory.push({ role: "user", parts: [{ text: userText }] });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{
              text: "Sən azərbaycanca danışan, çox ağıllı və köməksevər bir süni intellekt köməkçisisən. Adın 'CHAT A.I+'-dır. Həmişə Azərbaycan dilində, qrammatik cəhətdən düzgün, aydın və mehriban şəkildə cavab ver."
            }]
          },
          contents: conversationHistory
        })
      }
    );

    if (response.status === 429 || response.status === 503) {
      conversationHistory.pop();
      if (retryCount < 2) {
        const delay = (retryCount + 1) * 5000;
        await new Promise(res => setTimeout(res, delay));
        return callGeminiAPI(userText, retryCount + 1);
      }
      throw new Error("API açarının gündəlik limiti dolub. Zəhmət olmasa <strong>Parametrlər</strong>-dən yeni açar daxil edin.");
    }

    if (response.status === 400 || response.status === 401 || response.status === 403) {
      conversationHistory.pop();
      throw new Error("API açarı yanlışdır və ya keçərsizdir. <strong>Parametrlər</strong>-dən düzgün açarı daxil edin.");
    }

    if (!response.ok) {
      conversationHistory.pop();
      throw new Error(`Gemini API xətası. Status: ${response.status}`);
    }

    const data = await response.json();
    const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Təəssüf ki, cavab almaq mümkün olmadı.";
    conversationHistory.push({ role: "model", parts: [{ text: botReply }] });
    return botReply;
  }

  async function handleSend() {
    const text = inputField.value.trim();
    if (text === "") return;

    if (!getApiKey()) {
      appendMessage('bot', '🔑 Zəhmət olmasa <strong>⚙️ Parametrlər</strong>-dən Gemini API açarınızı daxil edin. Açarı <a href="https://aistudio.google.com/apikey" target="_blank" style="color:#5865f2;">aistudio.google.com</a> saytından pulsuz əldə edə bilərsiniz.', false);
      return;
    }

    appendMessage('user', text);
    addHistoryUI(text);
    inputField.value = "";
    sendBtn.disabled = true;

    const typingMsgId = "typing-" + Date.now();
    appendMessage('bot', "Düşünürəm...", false, typingMsgId);

    try {
      const botReply = await callGeminiAPI(text);
      removeMessage(typingMsgId);
      appendMessage('bot', botReply);
    } catch (error) {
      console.error(error);
      removeMessage(typingMsgId);
      const errDiv = document.createElement('div');
      errDiv.className = 'message-bubble bot';
      const isDark = document.body.classList.contains("dark-mode");
      errDiv.style.cssText = `max-width:70%;margin-bottom:20px;padding:15px 20px;border-radius:20px;font-size:15px;line-height:1.6;align-self:flex-start;background:${isDark?'#1a1a1a':'white'};color:${isDark?'#eee':'#333'};border-bottom-left-radius:5px;box-shadow:0 2px 10px rgba(0,0,0,0.05);`;
      errDiv.innerHTML = `⚠️ ${error.message}`;
      const container = document.getElementById('chat-display-area');
      if (container) { container.appendChild(errDiv); container.scrollTop = container.scrollHeight; }
    } finally {
      sendBtn.disabled = false;
    }
  }

  function removeMessage(id) {
    const msgElement = document.getElementById(id);
    if (msgElement) {
      msgElement.remove();
    }
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

  const settingsBtn = document.getElementById("settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeModalBtn = document.querySelector(".close-modal");
  const settingsNameInput = document.getElementById("settings-name-input");
  const settingsImgInput = document.getElementById("settings-img-input");
  const settingsApiKeyInput = document.getElementById("settings-api-key-input");
  const saveSettingsBtn = document.getElementById("save-settings-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (settingsBtn && settingsModal) {
    settingsBtn.addEventListener("click", () => {
      settingsNameInput.value = localStorage.getItem("userName") || "";
      settingsImgInput.value = localStorage.getItem("userImg") || "";
      if (settingsApiKeyInput) {
        settingsApiKeyInput.value = localStorage.getItem("geminiApiKey") || "";
      }
      settingsModal.classList.add("show");
    });

    if (closeModalBtn) {
      closeModalBtn.addEventListener("click", () => {
        settingsModal.classList.remove("show");
      });
    }

    window.addEventListener("click", (e) => {
      if (e.target === settingsModal) {
        settingsModal.classList.remove("show");
      }
    });

    if (saveSettingsBtn) {
      saveSettingsBtn.addEventListener("click", () => {
        const newName = settingsNameInput.value.trim();
        const newImg = settingsImgInput.value.trim();
        
        if (newName) {
          localStorage.setItem("userName", newName);
          if (userNameEl) userNameEl.textContent = newName;
        }
        if (newImg) {
          localStorage.setItem("userImg", newImg);
          if (userImgEl) userImgEl.src = newImg;
        }
        if (settingsApiKeyInput) {
          localStorage.setItem("geminiApiKey", settingsApiKeyInput.value.trim());
        }
        settingsModal.classList.remove("show");
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("userName");
        localStorage.removeItem("userImg");
        window.location.href = "./index.html";
      });
    }
  }
});
// UPSIDA Chat Widget - Website Integration Component
// This file provides a small JavaScript snippet for easy website integration

class UPSIDAChatWidget {
  constructor(config = {}) {
    this.config = {
      position: config.position || 'bottom-right', // bottom-right, bottom-left, top-right, top-left
      theme: config.theme || 'blue', // blue, green, orange
      apiKey: config.apiKey || null,
      apiBaseURL: config.apiBaseURL || 'https://api.upsida.gov.in',
      ...config
    };
    
    this.isOpen = false;
    this.api = new UPSIDAAPI();
    this.api.setConfig({
      baseURL: this.config.apiBaseURL,
      apiKey: this.config.apiKey
    });
    
    this.init();
  }

  init() {
    this.createWidget();
    this.attachEventListeners();
    this.loadStyles();
  }

  createWidget() {
    // Create widget container
    this.widgetContainer = document.createElement('div');
    this.widgetContainer.id = 'upsida-chat-widget';
    this.widgetContainer.className = `upsida-widget ${this.config.position} theme-${this.config.theme}`;
    
    // Create chat button
    this.chatButton = document.createElement('div');
    this.chatButton.className = 'upsida-chat-button';
    this.chatButton.innerHTML = `
      <div class="chat-icon">🛠️</div>
      <div class="chat-label">UPSIDA Assistant</div>
      <div class="notification-badge" style="display: none;">1</div>
    `;
    
    // Create chat window
    this.chatWindow = document.createElement('div');
    this.chatWindow.className = 'upsida-chat-window';
    this.chatWindow.innerHTML = `
      <div class="chat-header">
        <div class="header-content">
          <div class="header-icon">🛠️</div>
          <div class="header-text">
            <div class="header-title">UPSIDA Complaint Assistant</div>
            <div class="header-subtitle">AI-powered support</div>
          </div>
        </div>
        <button class="close-button" aria-label="Close chat">×</button>
      </div>
      <div class="chat-body">
        <div class="chat-messages" id="chat-messages"></div>
        <div class="chat-input-container">
          <input type="text" id="chat-input" placeholder="Type your message..." />
          <button id="send-button">Send</button>
        </div>
      </div>
    `;
    
    // Append elements
    this.widgetContainer.appendChild(this.chatButton);
    this.widgetContainer.appendChild(this.chatWindow);
    document.body.appendChild(this.widgetContainer);
    
    // Store references
    this.messagesContainer = this.chatWindow.querySelector('#chat-messages');
    this.inputField = this.chatWindow.querySelector('#chat-input');
    this.sendButton = this.chatWindow.querySelector('#send-button');
  }

  attachEventListeners() {
    // Chat button click
    this.chatButton.addEventListener('click', () => {
      this.toggleChat();
    });
    
    // Close button click
    this.chatWindow.querySelector('.close-button').addEventListener('click', () => {
      this.closeChat();
    });
    
    // Send button click
    this.sendButton.addEventListener('click', () => {
      this.sendMessage();
    });
    
    // Enter key press
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.sendMessage();
      }
    });
    
    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!this.widgetContainer.contains(e.target) && this.isOpen) {
        this.closeChat();
      }
    });
  }

  toggleChat() {
    if (this.isOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  openChat() {
    this.isOpen = true;
    this.chatWindow.classList.add('open');
    this.chatButton.classList.add('active');
    this.inputField.focus();
    
    // Initialize chat if first time
    if (this.messagesContainer.children.length === 0) {
      this.initializeChat();
    }
  }

  closeChat() {
    this.isOpen = false;
    this.chatWindow.classList.remove('open');
    this.chatButton.classList.remove('active');
  }

  initializeChat() {
    // Initialize the main chatbot logic
    if (typeof initializeUPSIDAChatbot === 'function') {
      initializeUPSIDAChatbot(this.messagesContainer, this.inputField, this.api);
    } else {
      // Fallback initialization
      this.showWelcomeMessage();
    }
  }

  showWelcomeMessage() {
    const welcomeDiv = document.createElement('div');
    welcomeDiv.className = 'chat-message bot';
    welcomeDiv.innerHTML = `
      <div class="message-content">
        <div class="message-text">
          Welcome! नमस्ते! I'm the UPSIDA AI Assistant. How can I help you today?
        </div>
        <div class="message-options">
          <button class="option-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.upsidaWidget.handleOption('lodge')">
            Lodge a New Complaint
          </button>
          <button class="option-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.upsidaWidget.handleOption('check')">
            Check Complaint Status
          </button>
        </div>
      </div>
    `;
    this.messagesContainer.appendChild(welcomeDiv);
    this.scrollToBottom();
  }

  handleOption(option) {
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-message user';
    userDiv.innerHTML = `<div class="message-content">${option === 'lodge' ? 'Lodge a New Complaint' : 'Check Complaint Status'}</div>`;
    this.messagesContainer.appendChild(userDiv);
    
    // Handle the option selection
    if (option === 'lodge') {
      this.showMessage('To proceed, I need to verify your identity. Please enter your 10-digit mobile number registered with UPSIDA.');
    } else {
      this.showMessage('Please enter your Complaint ID to get the status.');
    }
    
    this.scrollToBottom();
  }

  sendMessage() {
    const message = this.inputField.value.trim();
    if (!message) return;
    
    // Show user message
    const userDiv = document.createElement('div');
    userDiv.className = 'chat-message user';
    userDiv.innerHTML = `<div class="message-content">${message}</div>`;
    this.messagesContainer.appendChild(userDiv);
    
    this.inputField.value = '';
    this.scrollToBottom();
    
    // Process message (this would integrate with your main chatbot logic)
    this.processUserMessage(message);
  }

  showMessage(text, options = []) {
    const botDiv = document.createElement('div');
    botDiv.className = 'chat-message bot';
    
    let optionsHtml = '';
    if (options.length > 0) {
      optionsHtml = '<div class="message-options">';
      options.forEach(option => {
        optionsHtml += `<button class="option-btn" onclick="this.parentElement.parentElement.parentElement.parentElement.upsidaWidget.handleOption('${option.value}')">${option.text}</button>`;
      });
      optionsHtml += '</div>';
    }
    
    botDiv.innerHTML = `
      <div class="message-content">
        <div class="message-text">${text}</div>
        ${optionsHtml}
      </div>
    `;
    
    this.messagesContainer.appendChild(botDiv);
    this.scrollToBottom();
  }

  processUserMessage(message) {
    // This would integrate with your main chatbot logic
    // For now, just show a simple response
    setTimeout(() => {
      this.showMessage('Thank you for your message. I\'m processing your request...');
    }, 1000);
  }

  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  loadStyles() {
    if (document.getElementById('upsida-widget-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'upsida-widget-styles';
    style.textContent = this.getWidgetStyles();
    document.head.appendChild(style);
  }

  getWidgetStyles() {
    return `
      .upsida-widget {
        position: fixed;
        z-index: 10000;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .upsida-widget.bottom-right {
        bottom: 20px;
        right: 20px;
      }
      
      .upsida-widget.bottom-left {
        bottom: 20px;
        left: 20px;
      }
      
      .upsida-widget.top-right {
        top: 20px;
        right: 20px;
      }
      
      .upsida-widget.top-left {
        top: 20px;
        left: 20px;
      }
      
      .upsida-chat-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #1976d2;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        transition: all 0.3s ease;
        position: relative;
      }
      
      .upsida-chat-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }
      
      .upsida-chat-button.active {
        background: #1565c0;
      }
      
      .chat-icon {
        font-size: 24px;
        margin-bottom: 2px;
      }
      
      .chat-label {
        font-size: 8px;
        text-align: center;
        line-height: 1;
      }
      
      .notification-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #f44336;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
      }
      
      .upsida-chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 350px;
        height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.15);
        display: none;
        flex-direction: column;
        overflow: hidden;
      }
      
      .upsida-chat-window.open {
        display: flex;
      }
      
      .chat-header {
        background: #1976d2;
        color: white;
        padding: 16px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      
      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      
      .header-icon {
        font-size: 24px;
      }
      
      .header-title {
        font-weight: bold;
        font-size: 14px;
      }
      
      .header-subtitle {
        font-size: 11px;
        opacity: 0.8;
      }
      
      .close-button {
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s ease;
      }
      
      .close-button:hover {
        background: rgba(255,255,255,0.1);
      }
      
      .chat-body {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      
      .chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .chat-message {
        max-width: 80%;
        padding: 8px 12px;
        border-radius: 12px;
        word-wrap: break-word;
      }
      
      .chat-message.user {
        background: #e3f2fd;
        color: #1976d2;
        align-self: flex-end;
        margin-left: auto;
      }
      
      .chat-message.bot {
        background: #f5f5f5;
        color: #333;
        align-self: flex-start;
      }
      
      .message-content {
        font-size: 14px;
        line-height: 1.4;
      }
      
      .message-options {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      
      .option-btn {
        background: #1976d2;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 12px;
        transition: background 0.3s ease;
      }
      
      .option-btn:hover {
        background: #1565c0;
      }
      
      .chat-input-container {
        padding: 16px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 8px;
      }
      
      #chat-input {
        flex: 1;
        padding: 10px 12px;
        border: 1px solid #ddd;
        border-radius: 20px;
        font-size: 14px;
        outline: none;
      }
      
      #chat-input:focus {
        border-color: #1976d2;
      }
      
      #send-button {
        background: #1976d2;
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 20px;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.3s ease;
      }
      
      #send-button:hover {
        background: #1565c0;
      }
      
      /* Theme variations */
      .theme-green .upsida-chat-button,
      .theme-green .chat-header,
      .theme-green .option-btn,
      .theme-green #send-button {
        background: #4caf50;
      }
      
      .theme-green .upsida-chat-button:hover,
      .theme-green .option-btn:hover,
      .theme-green #send-button:hover {
        background: #388e3c;
      }
      
      .theme-orange .upsida-chat-button,
      .theme-orange .chat-header,
      .theme-orange .option-btn,
      .theme-orange #send-button {
        background: #ff9800;
      }
      
      .theme-orange .upsida-chat-button:hover,
      .theme-orange .option-btn:hover,
      .theme-orange #send-button:hover {
        background: #f57c00;
      }
      
      /* Responsive design */
      @media (max-width: 480px) {
        .upsida-chat-window {
          width: calc(100vw - 40px);
          height: calc(100vh - 120px);
          bottom: 80px;
          right: 20px;
        }
        
        .upsida-widget.bottom-right,
        .upsida-widget.bottom-left {
          bottom: 10px;
        }
        
        .upsida-widget.bottom-right {
          right: 10px;
        }
        
        .upsida-widget.bottom-left {
          left: 10px;
        }
      }
    `;
  }
}

// Global initialization function
window.initializeUPSIDAChatWidget = function(config) {
  const widget = new UPSIDAChatWidget(config);
  widget.upsidaWidget = widget; // For option handling
  return widget;
};

// Auto-initialize if config is provided
if (window.UPSIDA_CHAT_CONFIG) {
  window.upsidaChatWidget = window.initializeUPSIDAChatWidget(window.UPSIDA_CHAT_CONFIG);
} 
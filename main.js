// DOM Elements
const chatlogs = document.getElementById("chatlogs");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");

// Debug logging for initialization
console.log('Chat elements initialization:', {
  chatlogs: !!chatlogs,
  userInput: !!userInput,
  sendBtn: !!sendBtn,
  micBtn: !!micBtn
});

// Check if DOM elements exist
if (!chatlogs || !userInput || !sendBtn) {
  console.error("Required DOM elements not found");
  throw new Error("Required DOM elements not found");
}

// State management
let currentStep = "language_selection";
let language = "en";
let userPhone = null;
let userName = "User";
let userIntent = null; // 'lodge' or 'status' or 'profile'
let complaintData = {
  category: null,
  details: null,
  full_name: null,
  industrial_area: null
};
let currentComplaintId = "";
let uploadedFiles = []; // Track uploaded files
let token = null; // Store JWT after OTP verification
// Add global timer variables
let otpTimer = null;
let otpTimeLeft = 60;
// Set API base URL for backend
// const API_BASE = "http://localhost:3000";
const API_BASE = "https://compl-reg-api.onrender.com";
// Language-specific messages
const messages = {
  en: {
    welcome: "👋Hi there ! Welcome to the Grievance Redressal System!<br>I am the UPSIDA AI Assistant, here to help with your grievances.",
    selectLanguage: "🌐 To get started, please select your language by typing 'English' or 'Hindi'.",
    greeting: "👋 Hello! How can I help you today?",
    lodgeComplaint: "📝 Lodge a New Complaint",
    checkStatus: "📊 Check Complaint Status",
    enterMobile: "📱 To proceed, I need to verify your identity. Please enter your 10-digit mobile number.",
    invalidMobile: "❌ Invalid number. Please enter a 10-digit mobile number.",
    otpSent: "✅ Thank you. I've sent a 6-digit OTP to your number. Please enter it here.",
    invalidOTP: "❌ Incorrect OTP. Please try again.",
    welcomeBack: "👋 Welcome, {name}. Let's file your complaint. Please select the category of your issue.",
    selectCategory: "👇 Please select the category of your issue.",
    describeProblem: "✍️ Understood. The complaint is about {category}. Could you please describe the problem in detail for me?",
    uploadPhoto: "🖼️ Thank you for the details. A picture is often very helpful. If you have a photo of the issue, please use the upload button.",
    uploadFile: "📎 Upload File",
    skip: "➡️ Skip",
    complaintSubmitted: "✅ Thank you, {name}. Your complaint has been submitted successfully.",
    complaintId: "🆔 Your Reference ID is: {id}",
    updatesInfo: "🔔 You will receive updates via SMS and can also check the status here anytime. Can I help with anything else?",
    checkAnotherStatus: "📊 Check Another Status",
    endChat: "💬 End Chat",
    enterComplaintId: "🆔 Sure. Please enter your Complaint ID to get the status.",
    statusFor: "📄 Here is the status for complaint {id}:",
    status: "📊 Status: {status}",
    complaintCategory: "📁 Category: {category}",
    complaintDetails: "📝 Details: {details}",
    lastUpdate: "🕒 Last Update: {update}",
    anythingElse: "🤔 Is there anything else I can assist you with?",
    lodgeAnother: "📝 Lodge a New Complaint",
    checkAnotherId: "🆔 Check Another ID",
    fallback: "🤖 I'm sorry, I'm not equipped to handle that request right now. Please choose one of the options below, or if you need to speak to a person, please contact the UPSIDA helpdesk at 1800-XXX-XXXX.",
    humanHandoff: "📞 If you need to speak with a human agent, please call the UPSIDA helpline at 1800-XXX-XXXX during office hours (10 AM - 5 PM, Mon-Fri).",
    fileUploaded: "✅ File uploaded successfully.",
    noFileUploaded: "❌ No file uploaded.",
    updateProfile: "👤 Update Profile",
    enterName: "👤 Please enter your full name:",
    enterIndustrialArea: "📍 Please enter your industrial area name:",
    profileUpdated: "✅ Profile updated successfully!",
    profileUpdateError: "❌ Failed to update profile. Please try again.",
    invalidName: "❌ Please enter a valid name (minimum 2 characters).",
    invalidIndustrialArea: "❌ Please enter a valid industrial area name.",
    nameRecorded: "✅ Thank you. Your full name is recorded as '{name}'.",
    tryAgain: "🔄 Try Again",
    backToMenu: "↩️ Back to Main Menu"
  },
  hi: {
    welcome: "👋 शिकायत निवारण प्रणाली में आपका स्वागत है!<br>मैं यूपीसीडा एआई सहायक हूं, जो आपकी शिकायतों में मदद के लिए यहां है।",
    selectLanguage: "🌐 आरंभ करने के लिए, कृपया 'English' या 'Hindi' टाइप करके अपनी भाषा चुनें।",
    greeting: "👋 नमस्ते! मैं यूपीसीडा सहायक हूँ। आप क्या करना चाहते हैं?",
    lodgeComplaint: "📝 शिकायत दर्ज करें",
    checkStatus: "📊 शिकायत स्थिति जांचें",
    enterMobile: "📱 आगे बढ़ने के लिए, मुझे आपकी पहचान सत्यापित करने की आवश्यकता है। कृपया अपना 10-अंकों का मोबाइल नंबर दर्ज करें।",
    invalidMobile: "❌ अमान्य नंबर। कृपया 10-अंकों का मोबाइल नंबर दर्ज करें।",
    otpSent: "✅ धन्यवाद। आपके नंबर पर 6-अंकों का ओटीपी भेजा गया है। कृपया यहाँ दर्ज करें।",
    invalidOTP: "❌ गलत ओटीपी। कृपया पुनः प्रयास करें।",
    welcomeBack: "👋 मैं आपका स्वागत करता हूं, {name}। आइए आपकी शिकायत दर्ज करें। कृपया अपनी समस्या की श्रेणी चुनें।",
    selectCategory: "👇 कृपया अपनी समस्या की श्रेणी चुनें।",
    describeProblem: "✍️ समझ गया। शिकायत {category} से संबंधित है। कृपया समस्या का विवरण दें:",
    uploadPhoto: "🖼️ विवरण के लिए धन्यवाद। तस्वीर अक्सर बहुत मददगार होती है। यदि आपके पास समस्या की कोई तस्वीर है, तो कृपया अपलोड बटन का उपयोग करें।",
    uploadFile: "📎 फ़ाइल अपलोड करें",
    skip: "➡️ छोड़ें",
    complaintSubmitted: "✅ धन्यवाद, {name}। आपकी शिकायत सफलतापूर्वक दर्ज की गई है।",
    complaintId: "🆔 आपका संदर्भ आईडी है: {id}",
    updatesInfo: "🔔 आपको एसएमएस के माध्यम से अपडेट प्राप्त होंगे और यहाँ भी स्थिति जांच सकते हैं। क्या मैं कुछ और मदद कर सकता हूँ?",
    checkAnotherStatus: "📊 दूसरी स्थिति जांचें",
    endChat: "💬 चैट समाप्त करें",
    enterComplaintId: "🆔 ज़रूर। स्थिति जानने के लिए कृपया अपनी शिकायत आईडी दर्ज करें।",
    statusFor: "📄 यहाँ शिकायत {id} की स्थिति है:",
    status: "📊 स्थिति: {status}",
    complaintCategory: "📁 श्रेणी: {category}",
    complaintDetails: "📝 विवरण: {details}",
    lastUpdate: "🕒 अंतिम अपडेट: {update}",
    anythingElse: "🤔 क्या मैं कुछ और सहायता कर सकता हूँ?",
    lodgeAnother: "📝 नई शिकायत दर्ज करें",
    checkAnotherId: "🆔 दूसरी आईडी जांचें",
    fallback: "🤖 माफ़ कीजिए, मैं अभी उस अनुरोध को संभालने के लिए तैयार नहीं हूँ। कृपया नीचे दिए गए विकल्पों में से एक चुनें, या यदि आपको किसी व्यक्ति से बात करने की आवश्यकता है, तो कृपया यूपीसीडा हेल्पडेस्क से संपर्क करें 1800-XXX-XXXX पर।",
    humanHandoff: "📞 यदि आपको मानव एजेंट से बात करने की आवश्यकता है, तो कृपया कार्यालय समय (सुबह 10 बजे - शाम 5 बजे, सोम-शुक्र) के दौरान यूपीसीडा हेल्पलाइन 1800-XXX-XXXX पर कॉल करें।",
    fileUploaded: "✅ फ़ाइल सफलतापूर्वक अपलोड की गई।",
    noFileUploaded: "❌ कोई फ़ाइल अपलोड नहीं की गई।",
    updateProfile: "👤 प्रोफ़ाइल अपडेट करें",
    enterName: "👤 कृपया अपना पूरा नाम दर्ज करें:",
    enterIndustrialArea: "📍 कृपया अपने औद्योगिक क्षेत्र का नाम दर्ज करें:",
    profileUpdated: "✅ प्रोफ़ाइल सफलतापूर्वक अपडेट किया गया!",
    profileUpdateError: "❌ प्रोफ़ाइल अपडेट करने में विफल। कृपया पुनः प्रयास करें।",
    invalidName: "❌ कृपया एक वैध नाम दर्ज करें (न्यूनतम 2 अक्षर)।",
    invalidIndustrialArea: "❌ कृपया एक वैध औद्योगिक क्षेत्र का नाम दर्ज करें।",
    nameRecorded: "✅ धन्यवाद। आपका पूरा नाम '{name}' के रूप में दर्ज किया गया है।",
    tryAgain: "🔄 फिर से प्रयास करें",
    backToMenu: "↩️ मुख्य मेनू पर जाएं"
  }
};

// Add language-specific placeholder and send button text
const placeholders = {
  en: "Type your message...",
  hi: "अपना संदेश लिखें..."
};
const sendBtnTexts = {
  en: "Send",
  hi: "भेजें"
};
function getMessage(key, params = {}) {
  let message = messages[language][key] || messages.en[key];
  if (!message) {
    console.error(`Message key "${key}" not found for language "${language}"`);
    return `Message not found: ${key}`;
  }
  Object.keys(params).forEach(param => {
    message = message.replace(`{${param}}`, params[param]);
  });
  return message;
}
// Helper to add animated 🙏 after Namaste/नमस्ते
function addAnimatedNamaste(msg) {
  if (typeof msg !== 'string') return msg;
  if (msg.includes('नमस्ते')) {
    return msg.replace('नमस्ते', 'नमस्ते <span class="namaste-emoji1">🙏</span>');
  }
  if (msg.includes('Namaste')) {
    return msg.replace('Namaste', 'Namaste <span class="namaste-emoji1">🙏</span>');
  }
  return msg;
}
// Helper to return robot icon HTML with blinking eyelids
function getAnimatedRobotIcon() {
  return `
<span class="robot-inline-container">
<img src="assets/robot.png" class="robot-img-inline" alt="Robot" />
</span>
`;
}
// Add typing indicator before each bot message
function showTypingIndicator() {
  const typingDiv = document.createElement("div");
  typingDiv.className = "typing-indicator";
  typingDiv.id = "typing-indicator";
  typingDiv.innerHTML = '<span></span><span></span><span></span>';
  chatlogs.appendChild(typingDiv);
  chatlogs.scrollTop = chatlogs.scrollHeight;
}
function removeTypingIndicator() {
  const typingDiv = document.getElementById("typing-indicator");
  if (typingDiv) typingDiv.remove();
}
// Update showBotMessages to include icon and timestamp
async function showBotMessages(messageArray) {
  console.log("Showing bot messages:", messageArray);

  if (!chatlogs) {
    console.error("Chatlogs element not found");
    return;
  }

  for (let msg of messageArray) {
    showTypingIndicator();
    await new Promise(resolve => setTimeout(resolve, 700));
    removeTypingIndicator();

    const div = document.createElement("div");
    div.className = "chat bot";
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    div.innerHTML = `
      <div class="message-meta">
        <span class="message-icon"><img src="assets/favicon-32x32.png" alt="UPSIDA" style="width: 20px; height: 20px; vertical-align: middle;"></span>
        <span class="message-timestamp">${time}</span>
      </div>
      <div class="message-content">
        <span>${msg}</span>
      </div>
    `;

    chatlogs.appendChild(div);
    chatlogs.scrollTop = chatlogs.scrollHeight;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}
// Update showOptions to NOT show bot-meta (icon + name)
async function showOptions(options) {
  if (!chatlogs) {
    console.error("Chatlogs element not found in showOptions");
    return;
  }

  console.log("Showing options:", options);

  showTypingIndicator();
  await new Promise(resolve => setTimeout(resolve, 700));
  removeTypingIndicator();

  const optionsContainer = document.createElement("div");
  optionsContainer.className = "topic-buttons";

  options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.innerText = opt;

    // Add hover effect class
    btn.addEventListener('mouseover', () => btn.classList.add('hover'));
    btn.addEventListener('mouseout', () => btn.classList.remove('hover'));

    // Add click handler
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      console.log("Option selected:", opt);
      showUserMessage(opt);
      handleUserSelection(opt);
    });

    optionsContainer.appendChild(btn);
  });

  chatlogs.appendChild(optionsContainer);
  chatlogs.scrollTop = chatlogs.scrollHeight;
}
function showUserMessage(message) {
  console.log("Showing user message:", message);

  if (!chatlogs) {
    console.error("Chatlogs element not found");
    return;
  }

  const div = document.createElement("div");
  div.className = "chat user";
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  div.innerHTML = `
    <div class="message-meta">
        <span class="message-icon">👤</span>
        <span class="message-timestamp">${time}</span>
    </div>
    <div class="message-content">
        <span>${message}</span>
    </div>
  `;

  chatlogs.appendChild(div);
  chatlogs.scrollTop = chatlogs.scrollHeight;
}

// Initialize chat
async function initializeChat() {
  console.log("Initializing chat...");

  try {
    // Clear chat logs
    const chatlogs = document.getElementById("chatlogs");
    if (!chatlogs) {
      throw new Error("Chatlogs element not found");
    }
    chatlogs.innerHTML = "";

    // Initialize UI
    updateInputLanguageUI();

    // Show welcome message
    await showBotMessages([getMessage("welcome")]);
    // Show language selection as clickable buttons
    await showBotMessages([getMessage("selectLanguage")]);
    await showOptions(["English", "Hindi"]);
    setStep("language_selection");
    console.log("Chat initialized, waiting for language selection");

    // Focus input field
    const userInput = document.getElementById("userInput");
    if (userInput) {
      userInput.focus();
    }
  } catch (error) {
    console.error("Error initializing chat:", error);
    const errorMessage = language === "hi"
      ? "चैट शुरू करने में समस्या हुई। कृपया पेज को रिफ्रेश करें।"
      : "Error initializing chat. Please refresh the page.";
    showBotMessages([errorMessage]);
  }
}

// Initialize chat when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function () {
  console.log("DOM loaded, starting initialization");

  // First verify all required elements exist
  const requiredElements = {
    chatlogs: document.getElementById("chatlogs"),
    userInput: document.getElementById("userInput"),
    sendBtn: document.getElementById("sendBtn"),
    micBtn: document.getElementById("micBtn")
  };

  // Log element status
  console.log("Required elements status:", {
    chatlogs: !!requiredElements.chatlogs,
    userInput: !!requiredElements.userInput,
    sendBtn: !!requiredElements.sendBtn,
    micBtn: !!requiredElements.micBtn
  });

  // Check if any required elements are missing
  const missingElements = Object.entries(requiredElements)
    .filter(([key, element]) => !element)
    .map(([key]) => key);

  if (missingElements.length > 0) {
    console.error("Missing required elements:", missingElements);
    return;
  }

  // Set up event listeners
  requiredElements.sendBtn.addEventListener('click', function (e) {
    e.preventDefault();
    console.log("Send button clicked");
    sendMessage();
  });

  requiredElements.userInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      console.log("Enter key pressed");
      sendMessage();
    }
  });

  // Initialize chat
  initializeChat().catch(error => {
    console.error("Failed to initialize chat:", error);
  });
});

// Function to send message
function sendMessage() {
  console.log("sendMessage called");

  const userInput = document.getElementById("userInput");
  if (!userInput) {
    console.error("userInput element not found");
    return;
  }

  const msg = userInput.value.trim();
  console.log("Message to send:", msg, "Current step:", currentStep);

  if (!msg) {
    console.log("Empty message, ignoring");
    return;
  }

  // Show user message in chat
  showUserMessage(msg);

  // Clear input field
  userInput.value = "";

  // Handle the message
  handleUserInput(msg).catch(error => {
    console.error("Error handling user input:", error);
    showBotMessages([
      language === "hi"
        ? "क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।"
        : "Sorry, an error occurred. Please try again."
    ]);
  });

  // Focus back on input
  userInput.focus();
}

// Make sendMessage available globally
window.sendMessage = sendMessage;

function generateComplaintId() {
  const d = new Date();
  const year = d.getFullYear().toString().slice(-2);
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  const hours = d.getHours().toString().padStart(2, '0');
  const mins = d.getMinutes().toString().padStart(2, '0');
  const secs = d.getSeconds().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 900) + 100; // 3-digit random number
  return `UPSIDA-${year}${month}${day}-${hours}${mins}${secs}-${random}`;
}

async function handleUserSelection(selection) {
  // Global command check for ending chat - Enhanced with more variations
  if (isEndChatCommand(selection)) {
    await showBotMessages([getMessage("humanHandoff")]);
    setStep("end");
    return; // Stop further processing
  }

  switch (currentStep) {
    case "language_selection":
      const normalizedInput = selection.toLowerCase().trim();
      if (normalizedInput === "english" || normalizedInput.includes("english")) {
        language = "en";
        updateInputLanguageUI();
        await showBotMessages([getMessage("greeting")]);
        await showOptions([getMessage("lodgeComplaint"), getMessage("checkStatus")]);
        setStep("main_menu");
      } else if (normalizedInput === "hindi" || normalizedInput.includes("hindi") || normalizedInput.includes("हिंदी")) {
        language = "hi";
        updateInputLanguageUI();
        await showBotMessages([getMessage("greeting")]);
        await showOptions([getMessage("lodgeComplaint"), getMessage("checkStatus")]);
        setStep("main_menu");
      } else {
        await showBotMessages([getMessage("fallback")]);
      }
      break;
    case "end":
      // Do nothing on button click when chat is over
      break;
    case "main_menu":
      const sel = selection.trim();
      if (
        sel === getMessage("lodgeComplaint").trim() ||
        sel.toLowerCase().includes("lodge") ||
        sel.includes("शिकायत दर्ज करें") ||
        (sel.includes("शिकायत") && !sel.includes("स्थिति"))
      ) {
        userIntent = 'lodge'; // Set intent
        if (!token || !userPhone) {
          await showBotMessages([getMessage("enterMobile")]);
          setStep("mobile_input");
        } else {
          // Already verified, go to category selection directly
          await showBotMessages([getMessage("welcomeBack", { name: userName })]);
          await showOptions(language === "hi" ? ["बिजली", "पानी", "सड़कें", "कचरा", "अन्य"] : ["Electricity", "Water", "Roads", "Waste", "Other"]);
          setStep("category_selection");
        }
      } else if (
        sel === getMessage("checkStatus").trim() ||
        sel.toLowerCase().includes("check") ||
        sel.includes("शिकायत स्थिति जांचें") ||
        (sel.includes("स्थिति") && sel.includes("शिकायत")) ||
        sel.includes("जांच")
      ) {
        userIntent = 'status'; // Set intent
        if (!token || !userPhone) {
          await showBotMessages([getMessage("enterMobile")]);
          setStep("status_mobile_input");
        } else {
          // Already verified, fetch and show complaint IDs as options
          let userId = null;
          if (typeof userName === 'object' && userName.id) {
            userId = userName.id;
          } else if (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('upsida_user_id')) {
            userId = window.localStorage.getItem('upsida_user_id');
          }
          if (userId) {
            const complaintsList = await getUserComplaintIdsApi(token, userId);
            if (complaintsList.success && complaintsList.complaintIds && complaintsList.complaintIds.length > 0) {
              await showBotMessages([
                language === "hi"
                  ? "यह रही आपकी शिकायतें, कृपया एक Complaint ID चुनें जिसकी स्थिति देखनी है:"
                  : "Here are your complaints, please select a Complaint ID to check the status:"
              ]);
              await showOptions(complaintsList.complaintIds);
              setStep("select_complaint_id");
            } else {
              await showBotMessages([
                language === "hi"
                  ? "कोई शिकायत नहीं मिली।"
                  : "No complaints found."
              ]);
              setStep("main_menu");
            }
          } else {
            await showBotMessages([
              language === "hi"
                ? "यूज़र आईडी नहीं मिली, कृपया दोबारा लॉगिन करें।"
                : "User ID not found, please login again."
            ]);
            setStep("main_menu");
          }
        }
      } else if (
        sel === getMessage("updateProfile").trim() ||
        sel.toLowerCase().includes("update") ||
        sel.toLowerCase().includes("profile") ||
        sel.includes("प्रोफ़ाइल") ||
        sel.includes("अपडेट")
      ) {
        userIntent = 'profile'; // Set intent
        if (!token || !userPhone) {
          await showBotMessages([getMessage("enterMobile")]);
          setStep("profile_mobile_input");
        } else {
          // Already verified, go to profile name input directly
          complaintData.full_name = null; // Reset name before asking
          await showBotMessages([getMessage("enterName")]);
          setStep("profile_name_input");
        }
      } else {
        await showBotMessages([getMessage("fallback")]);
      }
      break;
    case "status_mobile_input":
      if (/^\d{10}$/.test(selection)) {
        userPhone = selection;
        // Call API to send OTP
        const result = await sendOTPApi(userPhone);
        if (result.success) {
          await showOtpInputWithTimer();
          setStep("status_otp_input");
        } else {
          await showBotMessages([result.message || getMessage("invalidMobile")]);
        }
      } else {
        await showBotMessages([getMessage("invalidMobile")]);
      }
      break;
    case "status_otp_input":
      const otpResultStatus = await verifyOTPApi(userPhone, selection);
      if (otpResultStatus.success) {
        hideOtpTimerUI();
        token = otpResultStatus.token;
        localStorage.setItem('upsida_jwt', token);
        userName = otpResultStatus.user && otpResultStatus.user.full_name ? otpResultStatus.user.full_name : "User";
        if (otpResultStatus.user && otpResultStatus.user.id) {
          localStorage.setItem('upsida_user_id', otpResultStatus.user.id);
        }
        let userId = null;
        if (otpResultStatus.user && otpResultStatus.user.id) {
          userId = otpResultStatus.user.id;
        } else if (typeof userName === 'object' && userName.id) {
          userId = userName.id;
        } else if (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('upsida_user_id')) {
          userId = window.localStorage.getItem('upsida_user_id');
        }
        if (userId) {
          const complaintsList = await getUserComplaintIdsApi(token, userId);
          if (complaintsList.success && complaintsList.complaintIds && complaintsList.complaintIds.length > 0) {
            await showBotMessages([
              language === "hi"
                ? "यह रही आपकी शिकायतें, कृपया एक Complaint ID चुनें जिसकी स्थिति देखनी है:"
                : "Here are your complaints, please select a Complaint ID to check the status:"
            ]);
            await showOptions(complaintsList.complaintIds);
            setStep("select_complaint_id");
          } else {
            await showBotMessages([
              language === "hi"
                ? "कोई शिकायत नहीं मिली।"
                : "No complaints found."
            ]);
            setStep("main_menu");
          }
        } else {
          await showBotMessages([
            language === "hi"
              ? "यूज़र आईडी नहीं मिली, कृपया दोबारा लॉगिन करें।"
              : "User ID not found, please login again."
          ]);
          setStep("main_menu");
        }
      } else {
        await showBotMessages([otpResultStatus.message || getMessage("invalidOTP")]);
      }
      break;
    case "category_selection":
      complaintData.category = selection;
      await showBotMessages([getMessage("describeProblem", { category: selection })]);
      setStep("problem_description");
      break;
    case "file_upload":
      const userInput = selection.toLowerCase().trim();
      if (userInput.includes("skip") || userInput.includes("छोड़ें")) {
        await submitComplaint();
      } else if (userInput.includes("upload") || userInput.includes("अपलोड")) {
        showFileUploadInterface();
      } else {
        await showBotMessages([getMessage("fallback")]);
      }
      break;
    case "complaint_error":
      if (selection.toLowerCase().includes(getMessage("tryAgain").toLowerCase()) || selection.toLowerCase().includes("कोशिश") || selection.toLowerCase().includes("फिर")) {
        await submitComplaint();
      } else if (selection.toLowerCase().includes(getMessage("backToMenu").toLowerCase()) || selection.toLowerCase().includes("मुख्य") || selection.toLowerCase().includes("वापस")) {
        await showBotMessages([getMessage("greeting")]);
        await showOptions([getMessage("lodgeComplaint"), getMessage("checkStatus")]);
        setStep("main_menu");
      } else {
        await showBotMessages([getMessage("fallback")]);
      }
      break;
    case "complaint_submitted":
      if (selection === getMessage("lodgeAnother")) {
        await handleComplaintLodging();
      } else if (selection === getMessage("checkAnotherId")) {
        // Remove manual complaint ID input - will use handleStatusCheck instead
        await handleStatusCheck(true);
      } else if (selection === getMessage("endChat")) {
        await showBotMessages([getMessage("humanHandoff")]);
        setStep("end");
      } else {
        await showBotMessages([getMessage("fallback")]);
      }
      break;
    case "status_checked":
      if (selection === getMessage("lodgeAnother")) {
        await handleComplaintLodging();
      } else if (selection === getMessage("checkAnotherStatus")) {
        await handleStatusCheck(true);
      } else if (selection === getMessage("endChat")) {
        await showBotMessages([getMessage("humanHandoff")]);
        setStep("end");
      } else {
        await showBotMessages([getMessage("fallback")]);
      }
      break;
    case "profile_mobile_input":
      if (/^\d{10}$/.test(selection)) {
        userPhone = selection;
        // Call API to send OTP
        const result = await sendOTPApi(userPhone);
        if (result.success) {
          await showOtpInputWithTimer();
          setStep("profile_otp_input");
        } else {
          await showBotMessages([result.message || getMessage("invalidMobile")]);
        }
      } else {
        await showBotMessages([getMessage("invalidMobile")]);
      }
      break;
    case "profile_otp_input":
      const otpResultProfile = await verifyOTPApi(userPhone, selection);
      if (otpResultProfile.success) {
        hideOtpTimerUI();
        token = otpResultProfile.token;
        localStorage.setItem('upsida_jwt', token);
        userName = otpResultProfile.user && otpResultProfile.user.full_name ? otpResultProfile.user.full_name : "User";
        await showBotMessages([getMessage("enterName")]);
        setStep("profile_name_input");
      } else {
        await showBotMessages([otpResultProfile.message || getMessage("invalidOTP")]);
      }
      break;
    case "profile_name_input":
      console.log("Processing name input:", selection);
      if (selection.trim().length >= 2) {
        // Append the new name part
        if (!complaintData.full_name) complaintData.full_name = "";
        complaintData.full_name = (complaintData.full_name + " " + selection.trim()).trim();
        userName = complaintData.full_name;

        const nameParts = complaintData.full_name.split(' ').length;

        if (nameParts >= 3) {
          // Assume name is complete and proceed
          await showBotMessages([getMessage("nameRecorded", { name: userName })]);
          await showBotMessages([getMessage("enterIndustrialArea")]);
          setStep("profile_industrial_area_input");
        } else {
          // Ask for confirmation to add more
          await showBotMessages([
            language === 'hi'
              ? `क्या आपका पूरा नाम '${userName}' है?`
              : `Is your full name '${userName}'?`
          ]);
          await showOptions([
            language === 'hi' ? "हाँ, सही है" : "Yes, that's correct",
            language === 'hi' ? "नहीं, और जोड़ें" : "No, add more"
          ]);
          setStep("profile_name_confirmation");
        }
      } else {
        console.log("Invalid name (too short)");
        await showBotMessages([getMessage("invalidName")]);
      }
      break;
    case "profile_name_confirmation":
      const confirmationInput = selection.toLowerCase().trim();
      if (confirmationInput.includes("yes") || confirmationInput.includes("हाँ")) {
        // Name is confirmed, proceed
        await showBotMessages([getMessage("enterIndustrialArea")]);
        setStep("profile_industrial_area_input");
      } else if (confirmationInput.includes("no") || confirmationInput.includes("नहीं")) {
        // User wants to add more to the name
        await showBotMessages([
          language === 'hi'
            ? "ठीक है, कृपया अपने नाम का अगला भाग दर्ज करें।"
            : "Okay, please enter the next part of your name."
        ]);
        setStep("profile_name_input");
      } else {
        // Re-ask if input is unclear
        await showBotMessages([
          language === 'hi'
            ? `क्या आपका पूरा नाम '${userName}' है?`
            : `Is your full name '${userName}'?`
        ]);
        await showOptions([
          language === 'hi' ? "हाँ, सही है" : "Yes, that's correct",
          language === 'hi' ? "नहीं, और जोड़ें" : "No, add more"
        ]);
      }
      break;
    case "profile_industrial_area_input":
      console.log("Processing industrial area input:", selection);
      if (selection.trim().length >= 2) {
        complaintData.industrial_area = selection.trim();
        console.log("Industrial area accepted:", complaintData.industrial_area);

        // Call API to update profile
        try {
          const updateResult = await updateProfileApi(token, complaintData.full_name, complaintData.industrial_area);
          if (updateResult.success) {
            await showBotMessages([getMessage("profileUpdated")]);

            // After profile update, check original intent
            if (userIntent === 'lodge') {
              await showBotMessages([getMessage("welcomeBack", { name: userName })]);
              await showOptions(
                language === "hi"
                  ? ["बिजली", "पानी", "सड़कें", "कचरा", "अन्य"]
                  : ["Electricity", "Water", "Roads", "Waste", "Other"]
              );
              setStep("category_selection");
            } else if (userIntent === 'status') {
              // Remove manual complaint ID input - will use handleStatusCheck instead
              await handleStatusCheck(true);
            } else {
              await showMainMenu(true);
            }
          } else {
            throw new Error(updateResult.message || "Profile update failed");
          }
        } catch (error) {
          console.error("Profile update error:", error);
          await showBotMessages([getMessage("profileUpdateError")]);
          await showOptions([getMessage("tryAgain"), getMessage("backToMenu")]);
          setStep("profile_error");
        }
      } else {
        console.log("Invalid industrial area (too short)");
        await showBotMessages([getMessage("invalidIndustrialArea")]);
      }
      break;
    case "problem_description":
      console.log("Processing problem description:", selection);
      if (selection.trim().length >= 10) {
        complaintData.details = selection.trim();
        console.log("Description accepted:", complaintData.details);
        await showBotMessages([getMessage("uploadPhoto")]);
        await showOptions([getMessage("uploadFile"), getMessage("skip")]);
        setStep("file_upload");
      } else {
        console.log("Description too short");
        await showBotMessages([
          language === "hi"
            ? "कृपया समस्या का विस्तृत विवरण दें (कम से कम 10 अक्षर)"
            : "Please provide a detailed description (minimum 10 characters)"
        ]);
      }
      break;
    case "select_complaint_id":
      if (selection.trim()) {
        const complaintResult = await getComplaintDetailApi(token, selection.trim());
        if (complaintResult.success && complaintResult.data) {
          const statusInfo = [
            getMessage("statusFor", { id: selection.trim() }),
            getMessage("status", { status: complaintResult.data.status }),
            getMessage("complaintCategory", { category: complaintResult.data.category }),
            getMessage("complaintDetails", { details: complaintResult.data.details }),
            getMessage("lastUpdate", { update: complaintResult.data.lastUpdate || 'N/A' })
          ].join('<br><br>');
          await showBotMessages([statusInfo]);
          await showOptions([getMessage("checkAnotherStatus"), getMessage("lodgeAnother"), getMessage("endChat")]);
          setStep("status_checked");
        } else {
          await showBotMessages([
            language === "hi"
              ? "शिकायत की स्थिति प्राप्त करने में विफल। कृपया सही Complaint ID चुनें।"
              : "Failed to get complaint status. Please select a valid Complaint ID."
          ]);
        }
      }
      break;
    default:
      await showBotMessages([getMessage("fallback")]);
      break;
  }
}
// API call to request OTP
async function sendOTPApi(mobileNumber) {
  try {
    const response = await fetch(`${API_BASE}/api/request-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: mobileNumber })
    });
    const data = await response.json();

    // Show OTP in alert if it's returned from the API
    if (data.success && data.otp) {
      alert(`OTP sent to database: ${data.otp}`);
    }

    return data; // { success, message, userStatus, isNewUser, otp }
  } catch (err) {
    return { success: false, message: 'Network error' };
  }
}
// API call to verify OTP
async function verifyOTPApi(mobileNumber, otp) {
  try {
    const response = await fetch(`${API_BASE}/api/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: mobileNumber, otp })
    });
    const data = await response.json();
    return data; // { success, message, token, userStatus, isProfileComplete, user }
  } catch (err) {
    return { success: false, message: 'Network error' };
  }
}
async function handleUserInput(input) {
  console.log("Processing user input:", input, "Current step:", currentStep, "Language:", language);

  if (!input) {
    console.error("Empty input received");
    return;
  }

  // Global command check for ending chat - Enhanced with more variations
  if (isEndChatCommand(input)) {
    await showBotMessages([getMessage("humanHandoff")]);
    setStep("end");
    return; // Stop further processing
  }

  try {
    switch (currentStep) {
      case "language_selection":
      case "end":
        const normalizedInput = input.toLowerCase().trim();
        if (normalizedInput === "english" || normalizedInput.includes("english")) {
          language = "en";
          updateInputLanguageUI();
          await showBotMessages([getMessage("greeting")]);
          await showOptions([getMessage("lodgeComplaint"), getMessage("checkStatus")]);
          setStep("main_menu");
        } else if (normalizedInput === "hindi" || normalizedInput.includes("hindi") || normalizedInput.includes("हिंदी")) {
          language = "hi";
          updateInputLanguageUI();
          await showBotMessages([getMessage("greeting")]);
          await showOptions([getMessage("lodgeComplaint"), getMessage("checkStatus")]);
          setStep("main_menu");
        } else {
          if (currentStep === "language_selection") {
            await showBotMessages([getMessage("selectLanguage")]);
          }
        }
        break;

      case "mobile_input":
      case "status_mobile_input":
      case "profile_mobile_input":
        console.log("Processing mobile input:", input);
        if (/^\d{10}$/.test(input)) {
          userPhone = input;
          console.log("Valid mobile number received:", userPhone);
          // Call API to send OTP
          const result = await sendOTPApi(userPhone);
          if (result.success) {
            console.log("OTP sent successfully");
            await showOtpInputWithTimer();
            setStep(currentStep === "mobile_input" ? "otp_input" :
              currentStep === "status_mobile_input" ? "status_otp_input" : "profile_otp_input");
          } else {
            console.log("OTP send failed:", result.message);
            await showBotMessages([result.message || getMessage("invalidMobile")]);
          }
        } else {
          console.log("Invalid mobile number format");
          await showBotMessages([getMessage("invalidMobile")]);
        }
        break;

      case "otp_input":
      case "status_otp_input":
      case "profile_otp_input":
        console.log("Processing OTP input:", input);
        const otpResult = await verifyOTPApi(userPhone, input);
        if (otpResult.success) {
          console.log("OTP verified successfully");
          hideOtpTimerUI();
          token = otpResult.token;
          localStorage.setItem('upsida_jwt', token);
          userName = otpResult.user && otpResult.user.full_name ? otpResult.user.full_name : "User";
          // Always save user.id to localStorage if present
          if (otpResult.user && otpResult.user.id) {
            localStorage.setItem('upsida_user_id', otpResult.user.id);
          }

          // If profile is not complete, we MUST force profile creation.
          if (!otpResult.isProfileComplete) {
            complaintData.full_name = null; // Reset name before asking
            await showBotMessages([getMessage("enterName")]);
            setStep("profile_name_input");
            return; // End processing here, will resume after profile is made
          }

          // Profile is complete, proceed based on step or intent.
          if (currentStep === 'status_otp_input' || userIntent === 'status') {
            // Remove manual complaint ID input - will use handleStatusCheck instead
            await handleStatusCheck(true);
          } else if (currentStep === 'profile_otp_input' || userIntent === 'profile') {
            complaintData.full_name = null; // Reset name before asking
            await showBotMessages([getMessage("enterName")]);
            setStep("profile_name_input");
          } else if (currentStep === 'otp_input' || userIntent === 'lodge') {
            await showBotMessages([getMessage("welcomeBack", { name: userName })]);
            await showOptions(
              language === "hi"
                ? ["बिजली", "पानी", "सड़कें", "कचरा", "अन्य"]
                : ["Electricity", "Water", "Roads", "Waste", "Other"]
            );
            setStep("category_selection");
          } else {
            await showMainMenu(true); // Fallback
          }
        } else {
          console.log("OTP verification failed:", otpResult.message);
          await showBotMessages([otpResult.message || getMessage("invalidOTP")]);
        }
        break;

      case "complaint_id_input":
        console.log("Processing complaint ID input:", input);
        if (input.trim()) {
          try {
            const complaintResult = await getComplaintDetailApi(token, input.trim());
            if (complaintResult.success && complaintResult.data) {
              const statusInfo = [
                getMessage("statusFor", { id: input.trim() }),
                getMessage("status", { status: complaintResult.data.status }),
                getMessage("complaintCategory", { category: complaintResult.data.category }),
                getMessage("complaintDetails", { details: complaintResult.data.details }),
                getMessage("lastUpdate", { update: complaintResult.data.lastUpdate || 'N/A' })
              ].join('<br><br>');

              await showBotMessages([statusInfo]);
              await showOptions([getMessage("checkAnotherStatus"), getMessage("lodgeAnother"), getMessage("endChat")]);
              setStep("status_checked");
            } else {
              throw new Error(complaintResult.message || "Failed to fetch complaint status");
            }
          } catch (error) {
            console.error("Error fetching complaint status:", error);
            await showBotMessages([
              language === "hi"
                ? "शिकायत की स्थिति प्राप्त करने में विफल। कृपया सही शिकायत आईडी दर्ज करें।"
                : "Failed to get complaint status. Please enter a valid complaint ID."
            ]);
          }
        } else {
          await showBotMessages([getMessage("enterComplaintId")]);
        }
        break;

      case "main_menu":
        console.log("Processing main menu selection:", input);
        const mainMenuInput = input.toLowerCase();
        if (mainMenuInput.includes(getMessage("lodgeComplaint").toLowerCase()) ||
          mainMenuInput.includes("lodge") ||
          mainMenuInput.includes("शिकायत दर्ज")) {
          await handleComplaintLodging();
        } else if (mainMenuInput.includes(getMessage("checkStatus").toLowerCase()) ||
          mainMenuInput.includes("check") ||
          mainMenuInput.includes("स्थिति")) {
          userIntent = 'status';
          await handleStatusCheck();
        } else if (mainMenuInput.includes(getMessage("updateProfile").toLowerCase()) ||
          mainMenuInput.includes("update") ||
          mainMenuInput.includes("profile") ||
          mainMenuInput.includes("प्रोफ़ाइल") ||
          mainMenuInput.includes("अपडेट")) {
          userIntent = 'profile';
          // Logic for profile update via manual input
          if (!token || !userPhone) {
            await showBotMessages([getMessage("enterMobile")]);
            setStep("profile_mobile_input");
          } else {
            await showBotMessages([getMessage("enterName")]);
            setStep("profile_name_input");
          }
        } else {
          await showBotMessages([getMessage("fallback")]);
        }
        break;

      case "profile_name_input":
        console.log("Processing name input:", input);
        if (input.trim().length >= 2) {
          // Append the new name part
          if (!complaintData.full_name) complaintData.full_name = "";
          complaintData.full_name = (complaintData.full_name + " " + input.trim()).trim();
          userName = complaintData.full_name;

          const nameParts = complaintData.full_name.split(' ').length;

          if (nameParts >= 3) {
            // Assume name is complete and proceed
            await showBotMessages([getMessage("nameRecorded", { name: userName })]);
            await showBotMessages([getMessage("enterIndustrialArea")]);
            setStep("profile_industrial_area_input");
          } else {
            // Ask for confirmation to add more
            await showBotMessages([
              language === 'hi'
                ? `क्या आपका पूरा नाम '${userName}' है?`
                : `Is your full name '${userName}'?`
            ]);
            await showOptions([
              language === 'hi' ? "हाँ, सही है" : "Yes, that's correct",
              language === 'hi' ? "नहीं, और जोड़ें" : "No, add more"
            ]);
            setStep("profile_name_confirmation");
          }
        } else {
          console.log("Invalid name (too short)");
          await showBotMessages([getMessage("invalidName")]);
        }
        break;

      case "profile_name_confirmation":
        const confirmationInput = input.toLowerCase().trim();
        if (confirmationInput.includes("yes") || confirmationInput.includes("हाँ")) {
          // Name is confirmed, proceed
          await showBotMessages([getMessage("enterIndustrialArea")]);
          setStep("profile_industrial_area_input");
        } else if (confirmationInput.includes("no") || confirmationInput.includes("नहीं")) {
          // User wants to add more to the name
          await showBotMessages([
            language === 'hi'
              ? "ठीक है, कृपया अपने नाम का अगला भाग दर्ज करें।"
              : "Okay, please enter the next part of your name."
          ]);
          setStep("profile_name_input");
        } else {
          // Re-ask if input is unclear
          await showBotMessages([
            language === 'hi'
              ? `क्या आपका पूरा नाम '${userName}' है?`
              : `Is your full name '${userName}'?`
          ]);
          await showOptions([
            language === 'hi' ? "हाँ, सही है" : "Yes, that's correct",
            language === 'hi' ? "नहीं, और जोड़ें" : "No, add more"
          ]);
        }
        break;

      case "profile_industrial_area_input":
        console.log("Processing industrial area input:", input);
        if (input.trim().length >= 2) {
          complaintData.industrial_area = input.trim();
          console.log("Industrial area accepted:", complaintData.industrial_area);

          // Call API to update profile
          try {
            const updateResult = await updateProfileApi(token, complaintData.full_name, complaintData.industrial_area);
            if (updateResult.success) {
              await showBotMessages([getMessage("profileUpdated")]);

              // After profile update, check original intent
              if (userIntent === 'lodge') {
                await showBotMessages([getMessage("welcomeBack", { name: userName })]);
                await showOptions(
                  language === "hi"
                    ? ["बिजली", "पानी", "सड़कें", "कचरा", "अन्य"]
                    : ["Electricity", "Water", "Roads", "Waste", "Other"]
                );
                setStep("category_selection");
              } else if (userIntent === 'status') {
                // Remove manual complaint ID input - will use handleStatusCheck instead
                await handleStatusCheck(true);
              } else {
                await showMainMenu(true);
              }
            } else {
              throw new Error(updateResult.message || "Profile update failed");
            }
          } catch (error) {
            console.error("Profile update error:", error);
            await showBotMessages([getMessage("profileUpdateError")]);
            await showOptions([getMessage("tryAgain"), getMessage("backToMenu")]);
            setStep("profile_error");
          }
        } else {
          console.log("Invalid industrial area (too short)");
          await showBotMessages([getMessage("invalidIndustrialArea")]);
        }
        break;

      case "category_selection":
        console.log("Processing category selection:", input);
        const validCategories = language === "hi"
          ? ["बिजली", "पानी", "सड़कें", "कचरा", "अन्य"]
          : ["Electricity", "Water", "Roads", "Waste", "Other"];

        const selectedCategory = validCategories.find(c => c.toLowerCase() === input.toLowerCase().trim());

        if (selectedCategory) {
          complaintData.category = selectedCategory;
          console.log("Category selected:", complaintData.category);
          await showBotMessages([getMessage("describeProblem", { category: selectedCategory })]);
          setStep("problem_description");
        } else {
          console.log("Invalid category selected");
          await showBotMessages([getMessage("selectCategory")]);
          await showOptions(validCategories);
        }
        break;

      case "problem_description":
        console.log("Processing problem description:", input);
        if (input.trim().length >= 10) {
          complaintData.details = input.trim();
          console.log("Description accepted:", complaintData.details);
          await showBotMessages([getMessage("uploadPhoto")]);
          await showOptions([getMessage("uploadFile"), getMessage("skip")]);
          setStep("file_upload");
        } else {
          console.log("Description too short");
          await showBotMessages([
            language === "hi"
              ? "कृपया समस्या का विस्तृत विवरण दें (कम से कम 10 अक्षर)"
              : "Please provide a detailed description (minimum 10 characters)"
          ]);
        }
        break;

      case "status_checked":
        console.log("Processing status_checked selection:", input);
        const statusInput = input.toLowerCase().trim();
        if (statusInput.includes("lodge") || statusInput.includes("शिकायत")) {
          await handleComplaintLodging();
        } else if (statusInput.includes("check") || statusInput.includes("status") || statusInput.includes("स्थिति")) {
          await handleStatusCheck(true);
        } else if (statusInput.includes("end") || statusInput.includes("समाप्त")) {
          await showBotMessages([getMessage("humanHandoff")]);
          setStep("end");
        } else {
          await showBotMessages([getMessage("fallback")]);
          await showOptions([getMessage("lodgeAnother"), getMessage("checkAnotherStatus"), getMessage("endChat")]);
        }
        break;

      case "complaint_submitted":
        console.log("Processing complaint_submitted selection:", input);
        const submittedInput = input.toLowerCase().trim();
        if (submittedInput.includes("lodge") || submittedInput.includes("शिकायत")) {
          await handleComplaintLodging();
        } else if (submittedInput.includes("id") || submittedInput.includes("आईडी")) {
          // Remove manual complaint ID input - will use handleStatusCheck instead
          await handleStatusCheck(true);
        } else if (submittedInput.includes("end") || submittedInput.includes("समाप्त")) {
          await showBotMessages([getMessage("humanHandoff")]);
          setStep("end");
        } else {
          await showBotMessages([getMessage("fallback")]);
          await showOptions([getMessage("lodgeAnother"), getMessage("checkAnotherId"), getMessage("endChat")]);
        }
        break;

      case "select_complaint_id":
        if (selection.trim()) {
          const complaintResult = await getComplaintDetailApi(token, selection.trim());
          if (complaintResult.success && complaintResult.data) {
            const statusInfo = [
              getMessage("statusFor", { id: selection.trim() }),
              getMessage("status", { status: complaintResult.data.status }),
              getMessage("complaintCategory", { category: complaintResult.data.category }),
              getMessage("complaintDetails", { details: complaintResult.data.details }),
              getMessage("lastUpdate", { update: complaintResult.data.lastUpdate || 'N/A' })
            ].join('<br><br>');
            await showBotMessages([statusInfo]);
            await showOptions([getMessage("checkAnotherStatus"), getMessage("lodgeAnother"), getMessage("endChat")]);
            setStep("status_checked");
          } else {
            await showBotMessages([
              language === "hi"
                ? "शिकायत की स्थिति प्राप्त करने में विफल। कृपया सही Complaint ID चुनें।"
                : "Failed to get complaint status. Please select a valid Complaint ID."
            ]);
          }
        }
        break;

      default:
        console.log("Unhandled step:", currentStep);
        await showBotMessages([getMessage("fallback")]);
        break;
    }
  } catch (error) {
    console.error("Error processing user input:", error);
    await showBotMessages([
      language === "hi"
        ? "क्षमा करें, एक त्रुटि हुई। कृपया पुनः प्रयास करें।"
        : "Sorry, an error occurred. Please try again."
    ]);
  }
}

function showFileUploadInterface() {
  if (!chatlogs) return;

  const div = document.createElement("div");
  div.className = "chat bot";

  const uploadArea = document.createElement("div");
  uploadArea.className = "file-upload-area";
  uploadArea.innerHTML = `
    <div class="upload-icon">📎</div>
    <div class="upload-text">
      <strong>${language === "hi" ? "फ़ाइल अपलोड करें" : "Upload Files"}</strong><br>
      <span>${language === "hi" ? "फ़ाइलें खींचें और छोड़ें या क्लिक करें" : "Drag & drop files or click to browse"}</span>
    </div>
  `;

  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.accept = "image/*";
  uploadInput.multiple = true;
  uploadInput.style.display = "none";
  uploadInput.onchange = (e) => handleFileUpload(e.target.files);

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("drag-over");
  });

  uploadArea.addEventListener("dragleave", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("drag-over");
    const files = e.dataTransfer.files;
    handleFileUpload(files);
  });

  uploadArea.addEventListener("click", () => uploadInput.click());

  div.appendChild(uploadArea);
  div.appendChild(uploadInput);
  chatlogs.appendChild(div);
  chatlogs.scrollTop = chatlogs.scrollHeight;
}

async function handleFileUpload(files) {
  if (!files || files.length === 0) {
    await showBotMessages([getMessage("noFileUploaded")]);
    return;
  }

  const file = files[0];
  console.log("File selected for upload:", file.name);

  const reader = new FileReader();
  reader.onload = async (e) => {
    // Show a preview card for the selected file
    const filePreview = document.createElement("div");
    filePreview.className = "chat user";
    filePreview.innerHTML = `
            <div class="file-preview-card">
                <img src="${e.target.result}" alt="${file.name}" class="file-preview-img">
                <div class="file-info">
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${(file.size / 1024).toFixed(1)} KB</span>
                </div>
            </div>
        `;
    chatlogs.appendChild(filePreview);
    chatlogs.scrollTop = chatlogs.scrollHeight;

    // Immediately try to submit the complaint with the file.
    await submitComplaint(file);
  };
  reader.readAsDataURL(file);
}

// Create Complaint API call (with optional file)
async function createComplaintApi(token, complaintId, category, details, file) {
  const formData = new FormData();
  formData.append('complaintId', complaintId);
  formData.append('category', category);
  formData.append('details', details);
  if (file) formData.append('file', file);
  try {
    const response = await fetch(`${API_BASE}/api/complaints`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    const data = await response.json();
    return data;
  } catch (err) {
    console.error('Complaint API error:', err);
    return { success: false, message: 'Network error' };
  }
}
// Get Complaint Detail API call
async function getComplaintDetailApi(token, complaintId) {
  const response = await fetch(`${API_BASE}/api/complaints/${complaintId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}
// Update Profile API call
async function updateProfileApi(token, full_name, industrial_area) {
  try {
    const response = await fetch(`${API_BASE}/api/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        full_name: full_name,
        industrial_area: industrial_area
      })
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return { success: true, data: data };
  } catch (error) {
    console.error('Update Profile API error:', error);
    return {
      success: false,
      error: error.message || 'Network error occurred while updating profile'
    };
  }
}
// Always read token from localStorage before making API calls
if (localStorage.getItem('upsida_jwt')) {
  token = localStorage.getItem('upsida_jwt');
}
// Add this function near the top of the file
async function translateText(text, targetLang = "hi") {
  const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);
  const data = await res.json();
  return data[0][0][0];
}
// Show OTP input with timer and resend button
async function showOtpInputWithTimer() {
  await showBotMessages([getMessage("otpSent")]);
  showOtpTimerUI();
  startOtpTimer();
}
// Show timer and resend button in UI
function showOtpTimerUI() {
  // Remove old timer if exists
  const oldTimer = document.getElementById("otp-timer-ui");
  if (oldTimer) oldTimer.remove();
  const div = document.createElement("div");
  div.id = "otp-timer-ui";
  div.className = "chat bot";
  div.innerHTML = `
<span id="otp-timer-label">${language === "hi" ? "पुनः भेजने के लिए प्रतीक्षा करें:" : "Wait to resend:"} <b id="otp-timer">${otpTimeLeft}</b>s</span>
<button id="resendOtpBtn" disabled style="margin-left:10px;">${language === "hi" ? "ओटीपी पुनः भेजें" : "Resend OTP"}</button>
`;
  chatlogs.appendChild(div);
  chatlogs.scrollTop = chatlogs.scrollHeight;
  document.getElementById("resendOtpBtn").onclick = async () => {
    if (otpTimeLeft === 0) {
      const result = await sendOTPApi(userPhone);
      if (result.success) {
        removePreviousOtpSentMessages();
        await showBotMessages([getMessage("otpSent")]);
        otpTimeLeft = 30;
        showOtpTimerUI(); // Show timer UI again after bot message
        startOtpTimer();
      } else {
        await showBotMessages([result.message || getMessage("invalidMobile")]);
      }
    }
  };
}
// Start or restart the OTP timer
function startOtpTimer() {
  otpTimeLeft = 30;
  updateOtpTimerUI();
  if (otpTimer) clearInterval(otpTimer);
  otpTimer = setInterval(() => {
    otpTimeLeft--;
    updateOtpTimerUI();
    if (otpTimeLeft <= 0) {
      clearInterval(otpTimer);
      const resendBtn = document.getElementById("resendOtpBtn");
      const label = document.getElementById("otp-timer-label");
      if (resendBtn) resendBtn.disabled = false;
      if (label) label.innerText = language === "hi"
        ? "ओटीपी नहीं मिला? पुनः भेजें:"
        : "Didn't get OTP? Resend:";
    }
  }, 1000);
}
// Update timer in UI
function updateOtpTimerUI() {
  const timerElem = document.getElementById("otp-timer");
  const resendBtn = document.getElementById("resendOtpBtn");
  if (timerElem) timerElem.innerText = otpTimeLeft;
  if (resendBtn) resendBtn.disabled = otpTimeLeft > 0;
}
// Add this function to remove the OTP timer UI and clear the timer
function hideOtpTimerUI() {
  const oldTimer = document.getElementById("otp-timer-ui");
  if (oldTimer) oldTimer.remove();
  if (otpTimer) {
    clearInterval(otpTimer);
    otpTimer = null;
  }
}
// Helper to remove all previous OTP sent messages from chatlogs
function removePreviousOtpSentMessages() {
  const chatDivs = chatlogs.querySelectorAll('.chat.bot');
  chatDivs.forEach(div => {
    if (div.innerText && (div.innerText.includes("Thank you. I've sent a 6-digit OTP") || div.innerText.includes("धन्यवाद। आपके नंबर पर 6-अंकों का ओटीपी भेजा गया है"))) {
      div.remove();
    }
  });
}
// Typing animation for input placeholder
function animatePlaceholder() {
  const input = document.getElementById('userInput');
  if (!input) return;
  // Stop any previous animation
  if (input._placeholderInterval) {
    clearTimeout(input._placeholderInterval);
    input._placeholderInterval = null;
  }
  const text = placeholders[language] || placeholders.en;
  let i = 0;
  let isAdding = true;
  function run() {
    input.setAttribute('placeholder', text.slice(0, i));
    if (isAdding) {
      if (i < text.length) {
        i++;
        input._placeholderInterval = setTimeout(run, 90);
      } else {
        isAdding = false;
        input._placeholderInterval = setTimeout(run, 1200); // Pause when full
      }
    } else {
      if (i > 0) {
        i--;
        input._placeholderInterval = setTimeout(run, 40);
      } else {
        isAdding = true;
        input._placeholderInterval = setTimeout(run, 400); // Pause before typing again
      }
    }
  }
  run();
}
// Add this function to dynamically update input maxlength
function updateInputMaxLength(maxLength) {
  const input = document.getElementById('userInput');
  if (input) {
    if (maxLength) {
      input.setAttribute('maxlength', maxLength);
    } else {
      input.removeAttribute('maxlength');
    }
  }
}
// Centralized function to set current step and update UI accordingly
function setStep(newStep) {
  currentStep = newStep;
  switch (newStep) {
    case 'mobile_input':
    case 'status_mobile_input':
    case 'profile_mobile_input':
      updateInputMaxLength(10);
      break;
    case 'otp_input':
    case 'status_otp_input':
    case 'profile_otp_input':
      updateInputMaxLength(6);
      break;
    default:
      updateInputMaxLength(null); // Remove maxlength for other steps
      break;
  }
}
// Helper function to show main menu with appropriate options
async function showMainMenu(showProfileOption = true) {
  await showBotMessages([getMessage("greeting")]);
  if (showProfileOption) {
    await showOptions([getMessage("lodgeComplaint"), getMessage("checkStatus"), getMessage("updateProfile")]);
  } else {
    await showOptions([getMessage("lodgeComplaint"), getMessage("checkStatus")]);
  }
  setStep("main_menu");
}
// Add this function to update the placeholder and Send button text dynamically based on language selection
function updateInputLanguageUI() {
  const input = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');
  if (input) input.setAttribute('placeholder', placeholders[language] || placeholders.en);
  if (sendBtn) sendBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i>';
  // Restart placeholder animation
  animatePlaceholder();
}
// Helper for speech UI
const waveformContainer = document.getElementById('waveform-container');

function generateWaveform() {
  if (!waveformContainer) return;
  waveformContainer.innerHTML = '';
  const bars = 25; // Adjusted for a smaller container
  for (let i = 0; i < bars; i++) {
    const bar = document.createElement('div');
    bar.className = 'wave-bar';
    // Set a random height for each bar to create a dynamic look
    bar.style.height = `${Math.floor(Math.random() * 30) + 5}px`;
    waveformContainer.appendChild(bar);
  }
}

// Speech-to-Text (Web Speech API) integration
if (micBtn && 'webkitSpeechRecognition' in window) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  micBtn.addEventListener('click', () => {
    if (micBtn.classList.contains('listening')) {
      recognition.stop();
    } else {
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      recognition.start();
    }
  });

  recognition.onstart = () => {
    micBtn.classList.add('listening');
    userInput.placeholder = language === 'hi' ? 'सुन रहा है...' : 'Listening...';
  };

  recognition.onresult = (event) => {
    let transcript = event.results[0][0].transcript;

    // For mobile number input, remove spaces to ensure validation passes.
    if (['mobile_input', 'status_mobile_input', 'profile_mobile_input'].includes(currentStep)) {
      transcript = transcript.replace(/\s+/g, '');
    }

    userInput.value = transcript;
    // Automatically send the message if there's a result
    if (transcript.trim()) {
      sendMessage();
    }
  };

  recognition.onend = () => {
    micBtn.classList.remove('listening');
    userInput.placeholder = placeholders[language];
  };

  recognition.onerror = (event) => {
    console.error('Speech recognition error:', event.error);
    micBtn.classList.remove('listening');
    userInput.placeholder = placeholders[language];
  };
} else if (micBtn) {
  micBtn.disabled = true;
  micBtn.title = 'Speech recognition not supported in this browser.';
}
// Add a helper to validate complaint data before submission
function validateComplaintData() {
  console.log('validateComplaintData called:', complaintData);
  if (!complaintData.category || !complaintData.details) {
    console.warn('Validation failed: category or details missing', complaintData);
    return false;
  }
  return true;
}
// Add a helper to submit the complaint
async function submitComplaint(file = null) {
  // Debug: log complaintData and token
  console.log('Submitting complaint with:', complaintData, 'token:', token, 'file:', file);

  // Always generate a fresh complaint ID for each submission attempt
  const complaintId = generateComplaintId();
  console.log(`Generated Complaint ID for this submission: ${complaintId}`);

  // Validate data before API call
  if (!validateComplaintData()) {
    console.error('Validation failed in submitComplaint:', complaintData);
    await showBotMessages([
      language === 'hi'
        ? 'कृपया सभी आवश्यक जानकारी भरें (श्रेणी और विवरण)।'
        : 'Please fill all required information (category and description).'
    ]);
    await showOptions([getMessage("tryAgain"), getMessage("backToMenu")]);
    setStep("complaint_error");
    return;
  }
  if (!token) {
    await showBotMessages([
      language === 'hi'
        ? 'सत्र समाप्त हो गया है। कृपया दोबारा लॉगिन करें।'
        : 'Session expired. Please login again.'
    ]);
    await showOptions([getMessage("backToMenu")]);
    setStep("complaint_error");
    return;
  }
  const result = await createComplaintApi(token, complaintId, complaintData.category, complaintData.details, file ? file : undefined);
  if (result.success && result.data && result.data.complaintId) {
    await showBotMessages([
      getMessage("complaintSubmitted", { name: userName }),
      getMessage("complaintId", { id: result.data.complaintId }),
      getMessage("updatesInfo")
    ]);
    await showOptions([getMessage("lodgeAnother"), getMessage("checkAnotherId"), getMessage("endChat")]);
    setStep("complaint_submitted");
  } else {
    await showBotMessages([
      result.message || (language === 'hi' ? 'शिकायत दर्ज करने में विफल। कृपया पुनः प्रयास करें।' : 'Complaint submission failed. Please try again.')
    ]);
    await showOptions([getMessage("tryAgain"), getMessage("backToMenu")]);
    setStep("complaint_error");
  }
}
// Helper function to handle complaint lodging
async function handleComplaintLodging() {
  if (!token || !userPhone) {
    await showBotMessages([getMessage("enterMobile")]);
    setStep("mobile_input");
  } else {
    await showBotMessages([getMessage("welcomeBack", { name: userName })]);
    await showOptions(
      language === "hi"
        ? ["बिजली", "पानी", "सड़कें", "कचरा", "अन्य"]
        : ["Electricity", "Water", "Roads", "Waste", "Other"]
    );
    setStep("category_selection");
  }
}

// Helper function to handle status check
async function handleStatusCheck(skipMobileInput = false) {
  if (!token || !userPhone || !skipMobileInput) {
    await showBotMessages([getMessage("enterMobile")]);
    setStep("status_mobile_input");
  } else {
    // Fetch and show complaint IDs as options
    let userId = null;
    if (typeof userName === 'object' && userName.id) {
      userId = userName.id;
    } else if (typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('upsida_user_id')) {
      userId = window.localStorage.getItem('upsida_user_id');
    }
    if (userId) {
      const complaintsList = await getUserComplaintIdsApi(token, userId);
      if (complaintsList.success && complaintsList.complaintIds && complaintsList.complaintIds.length > 0) {
        await showBotMessages([
          language === "hi"
            ? "यह रही आपकी शिकायतें, कृपया एक Complaint ID चुनें जिसकी स्थिति देखनी है:"
            : "Here are your complaints, please select a Complaint ID to check the status:"
        ]);
        await showOptions(complaintsList.complaintIds);
        setStep("select_complaint_id");
      } else {
        await showBotMessages([
          language === "hi"
            ? "कोई शिकायत नहीं मिली।"
            : "No complaints found."
        ]);
        setStep("main_menu");
      }
    } else {
      await showBotMessages([
        language === "hi"
          ? "यूज़र आईडी नहीं मिली, कृपया दोबारा लॉगिन करें।"
          : "User ID not found, please login again."
      ]);
      setStep("main_menu");
    }
  }
}

// Get all complaint IDs for the logged-in user
async function getUserComplaintIdsApi(token, userId) {
  const response = await fetch(`${API_BASE}/api/complaints/user/${userId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return await response.json();
}

// Helper function to check if user wants to end chat
function isEndChatCommand(input) {
  const endChatInput = input.toLowerCase().trim();
  const endChatPhrases = [
    // English variations
    "end chat", "end", "exit", "quit", "stop", "bye", "goodbye", "close chat", "finish chat",
    "end conversation", "stop chat", "close", "terminate", "end session", "logout", "sign out",
    // Hindi variations  
    "समाप्त", "बंद करें", "बाहर निकलें", "समाप्त करें", "चैट बंद करें", "चैट समाप्त करें",
    "बातचीत समाप्त करें", "बातचीत बंद करें", "सत्र समाप्त करें", "लॉगआउट", "साइन आउट",
    // Emoji variations
    "💬 end chat", "💬 चैट समाप्त करें", "🔚 end", "🔚 समाप्त", "❌ close", "❌ बंद करें"
  ];

  return endChatPhrases.some(phrase => endChatInput.includes(phrase.toLowerCase())) ||
    endChatInput === getMessage("endChat").toLowerCase();
}
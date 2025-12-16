 // OpenWeather API Key
 const WEATHER_API_KEY = 'b40b55215dc2ac1a39d66f96cfd92e7f';

 // Store conversation history for AI context
 let conversationHistory = [];

 async function sendMessage() {
     const input = document.getElementById("userInput");
     const messages = document.getElementById("messages");
     const sendBtn = document.getElementById("sendBtn");
     const text = input.value.trim();

     if (text === "") return;

     // Disable button while processing
     sendBtn.disabled = true;

     // Show user message
     messages.innerHTML += `<div class="user">You: ${escapeHtml(text)}</div>`;
     input.value = "";

     // Temporary loading message
     messages.innerHTML += `<div class="ai" id="loading">AI: typing...</div>`;
     messages.scrollTop = messages.scrollHeight;

     // Check if user is asking for weather
     const weatherMatch = text.match(/weather\s+(?:in\s+)?([a-zA-Z\s]+)/i);
     if (weatherMatch) {
         const city = weatherMatch[1].trim();
         await getWeather(city, messages);
         document.getElementById("loading")?.remove();
         sendBtn.disabled = false;
         input.focus();
         return;
     }

     // Check if user is asking for time
     const timeMatch = text.match(/time\s+(?:in\s+)?([a-zA-Z\s]+)/i);
     if (timeMatch) {
         const city = timeMatch[1].trim();
         await getTimeInCity(city, messages);
         document.getElementById("loading")?.remove();
         sendBtn.disabled = false;
         input.focus();
         return;
     }

     // Add user message to conversation history
     conversationHistory.push({
         role: "user",
         content: text
     });

     try {
         // Call Claude AI API for intelligent responses
         const response = await fetch("https://api.anthropic.com/v1/messages", {
             method: "POST",
             headers: {
                 "Content-Type": "application/json"
             },
             body: JSON.stringify({
                 model: "claude-sonnet-4-20250514",
                 max_tokens: 1000,
                 messages: conversationHistory
             })
         });

         const data = await response.json();
         document.getElementById("loading")?.remove();

         if (data.content && data.content[0] && data.content[0].text) {
             const aiReply = data.content[0].text;
             
             // Add AI response to conversation history
             conversationHistory.push({
                 role: "assistant",
                 content: aiReply
             });

             messages.innerHTML += `<div class="ai">AI: ${escapeHtml(aiReply)}</div>`;
         } else {
             messages.innerHTML += `<div class="ai">AI: I'm having trouble responding right now. Please try again!</div>`;
         }
         
     } catch (error) {
         document.getElementById("loading")?.remove();
         messages.innerHTML += `<div class="ai">AI: ${escapeHtml(generateSmartResponse(text))}</div>`;
         console.error('AI API Error:', error);
     }

     messages.scrollTop = messages.scrollHeight;
     sendBtn.disabled = false;
     input.focus();
 }

 // Fallback smart response generator
 function generateSmartResponse(userInput) {
     const lower = userInput.toLowerCase();
     
     // Greetings
     if (/^(hi|hello|hey|greetings|good morning|good afternoon|good evening)/i.test(lower)) {
         const responses = [
             "Hello! How can I help you today?",
             "Hi there! What can I do for you?",
             "Hey! Nice to chat with you!",
             "Greetings! What's on your mind?"
         ];
         return responses[Math.floor(Math.random() * responses.length)];
     }
     
     // Goodbye
     if (/(bye|goodbye|see you|farewell)/i.test(lower)) {
         return "Goodbye! Have a wonderful day! Feel free to come back anytime.";
     }
     
     // Thanks
     if (/(thank|thanks|appreciate)/i.test(lower)) {
         return "You're very welcome! I'm happy to help!";
     }
     
     // How are you
     if (/(how are you|how do you do|what's up|wassup)/i.test(lower)) {
         return "I'm doing great, thanks for asking! I'm here and ready to help you. How about you?";
     }
     
     // What can you do
     if (/(what can you|help me|capabilities|features)/i.test(lower)) {
         return "I can help you with:\n• Weather information (e.g., 'weather in London')\n• Time zones worldwide (e.g., 'time in Tokyo')\n• General questions and conversations\n• Math calculations\n• And much more! Just ask me anything!";
     }
     
     // Name questions
     if (/(your name|who are you|what are you)/i.test(lower)) {
         return "I'm SLEE AI Assistant! I'm here to help you with information, answer questions, and have great conversations. What would you like to know?";
     }
     
     // Math
     const mathMatch = lower.match(/(\d+)\s*([\+\-\*\/])\s*(\d+)/);
     if (mathMatch) {
         const num1 = parseFloat(mathMatch[1]);
         const op = mathMatch[2];
         const num2 = parseFloat(mathMatch[3]);
         let answer;
         switch(op) {
             case '+': answer = num1 + num2; break;
             case '-': answer = num1 - num2; break;
             case '*': answer = num1 * num2; break;
             case '/': answer = num1 / num2; break;
         }
         return `The answer is ${answer}!`;
     }
     
     // Questions
     if (lower.includes('?')) {
         return "That's an interesting question! While I may not have all the answers, I'm here to help. Could you provide more details or ask in a different way?";
     }
     
     // Default intelligent responses
     const defaultResponses = [
         "That's interesting! Tell me more about that.",
         "I see what you mean. Could you elaborate?",
         "That's a great point! What else would you like to discuss?",
         "Interesting! I'd love to hear more about your thoughts on this.",
         "I understand. How can I help you with that?",
         "That's fascinating! What specifically would you like to know?"
     ];
     
     return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
 }

 async function getWeather(city, messagesDiv) {
     try {
         const response = await fetch(
             `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
         );

         if (!response.ok) {
             messagesDiv.innerHTML += `<div class="ai">AI: Sorry, I couldn't find weather information for "${escapeHtml(city)}". Please check the city name.</div>`;
             return;
         }

         const data = await response.json();
         
         const weatherInfo = `
             <div class="weather-card">
                 <strong>🌍 ${data.name}, ${data.sys.country}</strong><br>
                 🌡️ Temperature: ${data.main.temp}°C (Feels like ${data.main.feels_like}°C)<br>
                 ☁️ Conditions: ${data.weather[0].description}<br>
                 💧 Humidity: ${data.main.humidity}%<br>
                 💨 Wind Speed: ${data.wind.speed} m/s<br>
                 🔼 High: ${data.main.temp_max}°C | 🔽 Low: ${data.main.temp_min}°C
             </div>
         `;

         messagesDiv.innerHTML += `<div class="ai">AI: Here's the current weather in ${escapeHtml(data.name)}:${weatherInfo}</div>`;
         messagesDiv.scrollTop = messagesDiv.scrollHeight;
     } catch (error) {
         messagesDiv.innerHTML += `<div class="ai">AI: Sorry, I encountered an error fetching weather data. Please try again.</div>`;
         console.error('Weather API Error:', error);
     }
 }

 async function getTimeInCity(city, messagesDiv) {
     try {
         const response = await fetch(
             `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}`
         );

         if (!response.ok) {
             messagesDiv.innerHTML += `<div class="ai">AI: Sorry, I couldn't find the city "${escapeHtml(city)}". Please check the spelling.</div>`;
             return;
         }

         const data = await response.json();
         
         const timezoneOffset = data.timezone;
         const utcTime = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
         const cityTime = new Date(utcTime + (timezoneOffset * 1000));
         
         const timeString = cityTime.toLocaleString('en-US', {
             weekday: 'long',
             year: 'numeric',
             month: 'long',
             day: 'numeric',
             hour: '2-digit',
             minute: '2-digit',
             second: '2-digit',
             hour12: true
         });

         const offsetHours = Math.floor(timezoneOffset / 3600);
         const offsetMins = Math.abs(Math.floor((timezoneOffset % 3600) / 60));
         const offsetString = `UTC${offsetHours >= 0 ? '+' : ''}${offsetHours}${offsetMins > 0 ? ':' + offsetMins : ''}`;

         messagesDiv.innerHTML += `<div class="ai">AI: <strong>🕐 Time in ${escapeHtml(data.name)}, ${data.sys.country}:</strong><br>${timeString}<br><em>Timezone: ${offsetString}</em></div>`;
         messagesDiv.scrollTop = messagesDiv.scrollHeight;
     } catch (error) {
         messagesDiv.innerHTML += `<div class="ai">AI: Sorry, I encountered an error fetching time data. Please try again.</div>`;
         console.error('Time API Error:', error);
     }
 }

 function escapeHtml(text) {
     const div = document.createElement('div');
     div.textContent = text;
     return div.innerHTML;
 }

 document.getElementById("userInput").addEventListener("keydown", function(e) {
     if (e.key === "Enter" && !e.shiftKey) {
         e.preventDefault();
         sendMessage();
     }
 });

 window.addEventListener('load', () => {
     const messages = document.getElementById("messages");
     messages.innerHTML += `<div class="ai">AI: Hello! I'm SLEE AI Assistant. I can chat about anything, check weather, tell you the time anywhere in the world, and more! What would you like to know? 🌍⏰</div>`;
 });
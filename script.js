// == Configuración ==
const WORKSPACE_SLUG = "lab-ot";   // tu workspace slug en minúsculas
const THREAD_ID      = "559977e2-f5dd-406a-b272-b32a537cd7d3"; // tu thread real
const API_URL = `http://localhost:3001/api/v1/workspace/${WORKSPACE_SLUG}/thread/${THREAD_ID}/stream-chat`;

const chatBody     = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendBtn      = document.querySelector("#send-message");

// Almacena el último mensaje del usuario
const userData = { message: null };

// Crea la burbuja de mensaje
function createMessageElement(content, ...classes) {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
}

// Lee el stream token a token y lo va mostrando
async function generateBotResponse(incomingMessageDiv) {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
  
    // 1) Petición al endpoint de stream
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Accept": "text/event-stream",
        "Content-Type": "application/json",
        "Authorization": "Bearer EKT4CY0-81RMKTF-M16BTTR-9PC8JDD"
      },
      body: JSON.stringify({
        message:   userData.message,
      mode:      "query",          // o "chat" si no quieres RAG
      reset:     false
      })
    });
  
    // 2) Manejo de error HTTP
    if (!res.ok) {
      let errText;
      try {
        errText = (await res.json()).error;
      } catch {
        errText = res.statusText;
      }
      messageElement.textContent = `❗ ${errText}`;
      incomingMessageDiv.classList.remove("thinking");
      return;
    }
  
    // 3) Leer el cuerpo como stream
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
  
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
  
      buffer += decoder.decode(value, { stream: true });
  
      // 4) Procesar línea a línea
      const lines = buffer.split("\n");
      // Mantén en buffer la última línea incompleta
      buffer = lines.pop();
  
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const jsonStr = line.replace("data:", "").trim();
        if (!jsonStr) continue;
  
        try {
          const parsed = JSON.parse(jsonStr);
          // 5) Mostrar sólo el textResponse
          if (parsed.textResponse) {
            messageElement.textContent += parsed.textResponse;
          }
        } catch (err) {
          console.error("Error parsing SSE chunk:", err);
        }
      }
    }
  
    incomingMessageDiv.classList.remove("thinking");
    // Actualiza en la burbuja
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
}

// Manejador al pulsar enviar
function handleOutgoingMessage(e) {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;

  userData.message = text;
  messageInput.value = "";

  // Burbuja del usuario
  const userDiv = createMessageElement(
    `<div class="message-text">${text}</div>`,
    "user-message"
  );
  chatBody.appendChild(userDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // Burbuja vacía del bot con indicador de "pensando"
  setTimeout(() => {
    const botDiv = createMessageElement(
      `<img src="/img/AI_Inteligencia Artificial_3Masa.svg" class="ai-icon-chat" width="35" height="35">
       <div class="message-text">
         <span class="thinking-indicator">
           <span class="dot"></span>
           <span class="dot"></span>
           <span class="dot"></span>
         </span>
       </div>`,
      "bot-message", "thinking"
    );
    chatBody.appendChild(botDiv);
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    generateBotResponse(botDiv);
  }, 200);
}

// Eventos
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") handleOutgoingMessage(e);
});
sendBtn.addEventListener("click", handleOutgoingMessage);

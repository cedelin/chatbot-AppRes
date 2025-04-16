const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const senderButton = document.querySelector("#send-message");

const API_KEY = "AIzaSyB0LgjwFpqzs7ga3gtPrzo7KojW9HgAGKE";
const API_URL = "http://localhost:11434/api/chat"

const userData = {
    message: null
}

const createMessageElement = (content, ...classes) => {
    const div = document.createElement("div");
    div.classList.add("message", ...classes);
    div.innerHTML = content;
    return div;
}

const generateBotResponse = async (incomingMessageDiv) => {
    const messageElement = incomingMessageDiv.querySelector(".message-text");
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama3.2",
            messages: [
                {
                    role: "user",
                    content: userData.message
                }
            ],
            stream: false
        })
    }
    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json();
        if(!response.ok) throw new Error(data.error.message);
        // Extract and display the bot's response
        const botContent = data.message && data.message.content ? data.message.content : "Sin respuesta";
        messageElement.innerHTML = botContent;
        const cleanContent = botContent
        botContent.replace(/\*\*(.*?)\*\*/g, '$1') // elimina negritas **texto**
        botContent.replace(/`{1,3}([^`]*)`{1,3}/g, '$1') // elimina bloques de código `texto`
        botContent.replace(/<\/?[^>]+(>|$)/g, ""); // elimina etiquetas HTML si quedan

        }catch (error) {
        console.log(error);
        }finally {
        incomingMessageDiv.classList.remove("thinking");
        chatBody.scrollTo( {top: chatBody.scrollHeight, behavior: "smooth"});
        }
}

const handleOutgoingMessage = (e) => {
    e.preventDefault();
    userData.message = messageInput.value.trim();
    messageInput.value = "";
    const messageContent = `<div class="message-text">${userData.message}</div>`;
    const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
    outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
    chatBody.appendChild(outgoingMessageDiv);
    chatBody.scrollTo( {top: chatBody.scrollHeight, behavior: "smooth"});

    setTimeout(() => {
        const messageContent = `<img src="/img/AI_Inteligencia Artificial_3Masa.svg" alt="AI Icon" 
				class="ai-icon-chat" width="50" height="50">
				<div class="message-text">
					<div class="thinking-indicator">
						<div class="dot"></div>
						<div class="dot"></div>
						<div class="dot"></div>
					</div>
				</div>`;
        const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
        chatBody.appendChild(incomingMessageDiv);
        chatBody.scrollTo( {top: chatBody.scrollHeight, behavior: "smooth"});
        generateBotResponse(incomingMessageDiv);
    }, 600);
}
messageInput.addEventListener ("keydown", (e) => {
    const userMessage = e.target.value.trim();
    if(e.key === "Enter" && userMessage) {
        handleOutgoingMessage(e);
    }
});

senderButton.addEventListener("click", (e) => handleOutgoingMessage(e));
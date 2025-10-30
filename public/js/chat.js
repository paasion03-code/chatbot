async function sendMessage() {
  const input = document.getElementById("user-input");
  const message = input.value.trim();
  if (!message) return;

  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `<div class="user-msg">${message}</div>`;

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message })
    });

    const data = await res.json();
    let botBubble = `<div class="bot-msg">`;

    if (data.reply) botBubble += `<p>${data.reply}</p>`;
    if (data.image) botBubble += `<img src="${data.image}" alt="Image">`;
    if (data.file) botBubble += `<a href="${data.file}" target="_blank">📎 Download File</a>`;

    botBubble += `</div>`;
    chatBox.innerHTML += botBubble;
  } catch (e) {
    chatBox.innerHTML += `<div class="bot-msg">⚠️ Error sending message.</div>`;
  }

  input.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}

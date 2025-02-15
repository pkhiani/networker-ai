document.addEventListener('DOMContentLoaded', function() {
    const messagesList = document.getElementById('messagesList');

    function loadMessages() {
        chrome.storage.sync.get(['savedMessages'], function(result) {
            const savedMessages = result.savedMessages || [];
            messagesList.innerHTML = ''; // Clear existing messages
            
            if (savedMessages.length === 0) {
                messagesList.innerHTML = '<p class="no-messages">No messages generated yet.</p>';
                return;
            }

            // Sort messages by timestamp, newest first
            savedMessages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

            // Create message cards
            savedMessages.forEach((messageData) => {
                const messageCard = document.createElement('div');
                messageCard.className = 'message-card';
                
                const date = new Date(messageData.timestamp).toLocaleDateString();
                const time = new Date(messageData.timestamp).toLocaleTimeString();

                messageCard.innerHTML = `
                    <div class="message-header">
                        <h3>${messageData.recipientName}</h3>
                        <span class="timestamp">${date} ${time}</span>
                    </div>
                    <p class="recipient-title">${messageData.recipientTitle}</p>
                    <p class="message-content">${messageData.message}</p>
                    <div class="message-actions">
                        <a href="${messageData.profileUrl}" target="_blank" class="profile-link">View Profile</a>
                        <button class="copy-btn" data-message="${messageData.message}">Copy Message</button>
                        <button class="delete-btn" data-timestamp="${messageData.timestamp}">Delete</button>
                    </div>
                `;

                messagesList.appendChild(messageCard);
            });

            // Add copy functionality to buttons
            document.querySelectorAll('.copy-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const message = this.getAttribute('data-message');
                    navigator.clipboard.writeText(message);
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = 'Copy Message';
                    }, 2000);
                });
            });

            // Add delete functionality
            document.querySelectorAll('.delete-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const timestampToDelete = this.getAttribute('data-timestamp');
                    chrome.storage.sync.get(['savedMessages'], function(result) {
                        const messages = result.savedMessages || [];
                        const updatedMessages = messages.filter(msg => msg.timestamp !== timestampToDelete);
                        chrome.storage.sync.set({ savedMessages: updatedMessages }, function() {
                            loadMessages(); // Reload the messages list
                        });
                    });
                });
            });
        });
    }

    // Initial load
    loadMessages();
}); 
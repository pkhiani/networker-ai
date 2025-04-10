document.addEventListener('DOMContentLoaded', function() {
    const messagesList = document.getElementById('messagesList');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

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

    // Function to search LinkedIn prospects
    async function searchProspects(query) {
        try {
            const response = await fetch('https://networker-api.up.railway.app/api/search-linkedin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });

            const data = await response.json();
            console.log('API Response:', data); // Log the response to check its structure
            displaySearchResults(data.web.results);
        } catch (error) {
            searchResults.innerHTML = `<p class="error">Error: ${error.message}</p>`;
        }
    }

    // Function to display search results
    function displaySearchResults(results) {
        searchResults.innerHTML = ''; // Clear previous results

        // Check if results is an array
        if (!Array.isArray(results)) {
            searchResults.innerHTML = '<p class="error">Unexpected response format.</p>';
            return;
        }

        if (results.length === 0) {
            searchResults.innerHTML = '<p class="no-results">No prospects found.</p>';
            return;
        }

        results.forEach(prospect => {
            const resultCard = document.createElement('div');
            resultCard.className = 'result-card';

            // Access the title and URL from the web object
            let title = prospect.title || 'No Title';
            const url = prospect.url || '#';

            // Remove "| LinkedIn" from the title
            title = title.replace(/\s*\|\s*LinkedIn\s*$/, '');

            resultCard.innerHTML = `
                <h3>${title}</h3>
            <div class="message-actions">
                <a href="${url}" target="_blank" class="profile-link">View Profile</a>
            </div>
            `;

            searchResults.appendChild(resultCard);
        });
    }

    // Event listener for search button
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            searchProspects(query);
        }
    });

    // Initial load
    loadMessages();
}); 
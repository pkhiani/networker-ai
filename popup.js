document.getElementById('generateMessage').addEventListener('click', async function() {
  const loadingMessage = document.getElementById('loadingMessage');
  const generatedMessage = document.getElementById('generatedMessage');
  
  // Show loading message
  loadingMessage.style.display = 'block';
  generatedMessage.value = '';

  // Get the current tab and send a message to the content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      files: ['contentScript.js']
    }, () => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getProfileDetails' }, async (profileDetails) => {
        if (!profileDetails.name || !profileDetails.role || !profileDetails.company) {
          loadingMessage.style.display = 'none';
          generatedMessage.value = 'Could not extract profile details. Please ensure you are on a LinkedIn profile page.';
          return;
        }

        // Construct the prompt based on extracted profile details
        const prompt = `Create a professional and friendly LinkedIn message requesting a coffee chat with someone named ${profileDetails.name}, who is a ${profileDetails.role} at ${profileDetails.company}. Tailor the message based on their professional background, and keep it under 200 characters.`;

        try {
          // Send the prompt to your backend server
          const response = await fetch('https://message-tailor-api-production.up.railway.app/api/generate', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ prompt })  // Send the prompt in the request body
          });

          const data = await response.json();
          loadingMessage.style.display = 'none';
          generatedMessage.value = data;
        } catch (error) {
          loadingMessage.style.display = 'none';
          generatedMessage.value = `Error: ${error.message}`;
        }
      });
    });
  });
});

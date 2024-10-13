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
              // Extracted experience details
              const experienceDetails = profileDetails.experience;

              // Initialize the prompt
              let prompt = "Generate a professional and friendly LinkedIn message under 200 characters requesting a brief chat using only their first name. Always include a thanks, and tailor the message using the profile's following experiences:\n\n";

              if (experienceDetails.length > 0) {
                  // Construct the prompt using experience details
                  experienceDetails.forEach(exp => {
                      prompt += `Name: ${exp.name}\nTitle: ${exp.title}\nCompany: ${exp.company}\nDescription: ${exp.description}\n\n`;
                  });
              } else {
                  prompt += 'No experience details found.\n';
              }

              // Send the prompt to your backend server
              try {
                  const response = await fetch('https://message-tailor-api-production.up.railway.app/api/generate', {
                      method: 'POST',
                      headers: {
                          'Content-Type': 'application/json'
                      },
                      body: JSON.stringify({ prompt })  // Send the constructed prompt
                  });

                  const data = await response.json();
                  loadingMessage.style.display = 'none';
                  generatedMessage.value = data;  // Display the response from the API

                  // Show the copy icon after generating the message
                  document.getElementById('copyIcon').style.display = 'block';  // Show the copy icon

              } catch (error) {
                  loadingMessage.style.display = 'none';
                  generatedMessage.value = `Error: ${error.message}`;
              }
          });
      });
  });
});

// Add the copy to clipboard functionality
document.getElementById('copyIcon').addEventListener('click', function() {
  const message = document.getElementById('generatedMessage').value;
  if (message) {
      navigator.clipboard.writeText(message)
          .then(() => {
              console.log('Message copied to clipboard!'); // Log the success
          })
          .catch(err => {
              console.error('Failed to copy: ', err);
          });
  }
});

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
  
          // Use extracted details to generate a tailored message
          const prompt = `Create a professional and friendly LinkedIn message requesting a brief chat with someone named ${profileDetails.name}, who is a ${profileDetails.role} at ${profileDetails.company}. Tailor the message based on their professional background. Use only their first name and make the message under 200 characters`;
  
          try {
            const message = await fetchOpenAIResponse(prompt);
            loadingMessage.style.display = 'none';
            generatedMessage.value = message;
          } catch (error) {
            loadingMessage.style.display = 'none';
            generatedMessage.value = `Error: ${error.message}`;
          }
        });
      });
    });
  });
  
  // Function to fetch response from OpenAI API
  async function fetchOpenAIResponse(prompt) {
    const apiKey = 'YOUR_OPENAI_API_KEY';
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // or gpt-4 if available
        messages: [{ role: "user", content: prompt }], // Structure for chat completion
        max_tokens: 150
      })
    });
  
    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.choices[0].message.content.trim(); // Adjusted for chat model response
  }
  
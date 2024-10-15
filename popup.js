// Save the one-liner entered by the user
document.getElementById('saveOneliner').addEventListener('click', function() {
    const oneliner = document.getElementById('userOneliner').value;

    // Save the one-liner using Chrome's storage API
    chrome.storage.sync.set({ userOneliner: oneliner }, function() {
        console.log('One-liner saved:', oneliner);
        // alert('Your one-liner has been saved!');
    });
});

// Load the saved one-liner when the popup is opened
document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get(['userOneliner'], function(result) {
        if (result.userOneliner) {
            document.getElementById('userOneliner').value = result.userOneliner;
        }
    });
});

// Generate the LinkedIn message using the user's one-liner and the profile details
document.getElementById('generateMessage').addEventListener('click', async function() {
    const loadingMessage = document.getElementById('loadingMessage');
    const generatedMessage = document.getElementById('generatedMessage');

    // Show loading message
    loadingMessage.style.display = 'block';
    generatedMessage.value = '';
    copyIcon.style.display = 'none';  // Hide icons before generation
    regenerateIcon.style.display = 'none';  // Hide regenerate icon

    // Retrieve the saved one-liner and generate the prompt
    chrome.storage.sync.get(['userOneliner'], function(result) {
        const userOneliner = result.userOneliner || 'No one-liner provided';

        // Get the current tab and send a message to the content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['contentScript.js']
            }, () => {
                chrome.tabs.sendMessage(tabs[0].id, { action: 'getProfileDetails' }, async (profileDetails) => {
                    // Extracted experience details
                    const experienceDetails = profileDetails.experience;

                    // Initialize the prompt, including the user's one-liner
                    let prompt = `Generate a professional and friendly LinkedIn message under 200 characters requesting a brief chat using only their first name. 
                    Summarize their career and experiences holistically, focusing on their overall growth, skills, and industry focus. 
                    Mention my background as "${userOneliner}", personalize the message as much as possible, and make it not sound AI generated.
                    Always include thanks, and craft the message based on the following summarized view of their experiences:\n\n`;

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
                        document.getElementById('regenerateIcon').style.display = 'block';

                    } catch (error) {
                        loadingMessage.style.display = 'none';
                        generatedMessage.value = `Error: ${error.message}`;
                    }
                });
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

// Regenerate message on click
document.getElementById('regenerateIcon').addEventListener('click', function() {
    document.getElementById('generateMessage').click(); // Triggers the generate button
});
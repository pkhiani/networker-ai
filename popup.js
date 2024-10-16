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
                    let prompt = `Create a concise, professional, and friendly LinkedIn message for initiating a brief chat, limited to 200 characters. Personalize the message using the recipient's first name, and prioritize their most recent role at the company, especially if they are involved in recruitment or hiring. Ask engaging questions about their experience at the company, such as what makes an ideal candidate, what it takes to be part of the company, or what the company culture is like. Mention your own background as "${userOneliner}" in a way that naturally complements their profile. Ensure the message sounds human-crafted and unique, ending with a note of thanks.

                                    ### Guidelines:
                                    1. **Personalized Greeting**: Start with the recipient’s first name.
                                    2. **Prioritize Recent Experience**: Focus on the recipient's most recent role at the company.
                                    4. **Relate to Your Background**: Connect your own experience ("${userOneliner}") to their role at the company or industry.
                                    5. **Varied Structure**: Ensure that the structure and tone of the message varies to avoid repetitive outputs.
                                    6. **Close with Appreciation**: End with a warm thank you and an invitation for a brief chat.

                                    ### Output Format:
                                    A short, friendly, and varied LinkedIn message that sounds authentic and natural, not exceeding 200 characters.

                                    ### Example Messages for Recruiters (Engaging Questions):
                                    1. "Hey [First Name], your work at [recent company] in [industry] is impressive! I'd love to know what makes an ideal candidate there. I’m a ${userOneliner}, and would love to chat. Thanks!"
                                    
                                    2. "Hi [First Name], I’ve always admired [recent company]. Could you share what it takes to be part of the team there? As a ${userOneliner}, I'd love to connect and learn more. Appreciate your time!"

                                    3. "Hey [First Name], I noticed you're at [recent company]—what's the company culture like? As a ${userOneliner}, I’m really interested in learning more. Thanks for considering a chat!"

                                    4. "Hello [First Name], working at [recent company] must be exciting! What qualities do you look for in candidates? I’m a ${userOneliner} and would love to connect for a brief chat. Thanks!"

                                    5. "Hey [First Name], your work at [recent company] in [industry] is impressive! I'd love to know what makes an ideal candidate there. I’m a ${userOneliner}, and would love to chat. Thanks!"

                                    6. "Hi [First Name], I’ve always admired [recent company]. Could you share what it takes to be part of the team there? As a ${userOneliner}, I'd love to connect and learn more. Appreciate your time!"

                                    7. "Hey [First Name], I noticed you're at [recent company]—what's the company culture like? As a ${userOneliner}, I’m really interested in learning more. Thanks for considering a chat!"

                                    8. "Hello [First Name], working at [recent company] must be exciting! What qualities do you look for in candidates? I’m a ${userOneliner} and would love to connect for a brief chat. Thanks!"

                                    9. "Hi [First Name], I see you're with [recent company]. I’m curious about what it’s like to work there! As a ${userOneliner}, I'd love to chat and learn more. Thanks for your time!"

                                    10. "Hey [First Name], I've heard great things about [recent company]! What qualities make someone successful there? I’m a ${userOneliner}, and I'd love to connect for a quick chat. Thanks!"

                                    11. "Hi [First Name], your role at [recent company] caught my eye—what do you think it takes to thrive there? I’m a ${userOneliner} and would love to discuss it further. Appreciate your time!"

                                    12. "Hello [First Name], I’m really curious about [recent company] and its values. What do you think stands out most about the team? I’m a ${userOneliner} and would love to chat. Thanks!"

                                    13. "Hey [First Name], I’m fascinated by [recent company]’s work in [industry]. What do you think makes someone a great fit there? I’m a ${userOneliner}, and I’d love to connect and chat!"

                                    14. "Hi [First Name], [recent company] seems like an amazing place to work. What makes someone stand out when applying there? I’m a ${userOneliner}, and I’d love to connect and discuss. Thanks!"

                                    ### Example Messages for Non-Recruiters:
                                    1. "Hi [First Name], your role at [company] in [industry] really stood out to me! I’m a ${userOneliner} and would love to connect about your journey. Thanks for your time!"
                                    
                                    2. "Hello [First Name], impressed by your growth in [specific skill] at [company]. I’m a ${userOneliner}, and I'd love to chat about your experience. Appreciate your time!"

                                    3. "Hey [First Name], your role in [recent job] at [company] is inspiring! As a ${userOneliner}, I’d love to hear more about your journey. Thanks!"

                                    4. "Hi [First Name], your work at [company] in [industry] caught my eye. I’m a ${userOneliner} and would love to chat about your role and industry trends. Thanks!"

                                    5. "Hi [First Name], your role at [company] in [industry] really stood out to me! I’m a ${userOneliner} and would love to connect about your journey. Thanks for your time!"

                                    6. "Hello [First Name], impressed by your growth in [specific skill] at [company]. I’m a ${userOneliner}, and I'd love to chat about your experience. Appreciate your time!"

                                    7. "Hey [First Name], your role in [recent job] at [company] is inspiring! As a ${userOneliner}, I’d love to hear more about your journey. Thanks!"

                                    8. "Hi [First Name], your work at [company] in [industry] caught my eye. I’m a ${userOneliner} and would love to chat about your role and industry trends. Thanks!"

                                    9. "Hey [First Name], I admire your work as a [specific role] at [company]. As a ${userOneliner}, I'd love to hear more about how you achieved such great success. Thanks!"

                                    10. "Hi [First Name], your career at [company] in [industry] is inspiring! I’m a ${userOneliner} and would love to connect to learn more about your career path. Thanks!"

                                    11. "Hello [First Name], your role as a [specific role] at [company] sounds really exciting! I’m a ${userOneliner}, and I'd love to hear more about how you broke into [industry]. Thanks!"

                                    12. "Hey [First Name], your work at [company] has caught my attention. I'd love to hear how you’ve grown into your role as a [specific role]. I’m a ${userOneliner}, and I’d love to chat!"

                                    13. "Hi [First Name], your journey in [industry] is really impressive. I’d love to hear more about your work at [company]—I’m a ${userOneliner}, and I’d love to connect. Thanks!"

                                    14. "Hey [First Name], I saw your role at [company] in [industry] and it sounds incredible. I’m a ${userOneliner}, and I’d love to hear more about your journey and how you got there!"

                                    ### Notes:
                                    - For recruiters, avoid explicitly mentioning their title but ask thoughtful questions about the company or qualities they look for in candidates.
                                    - For non-recruiters, ask intriguing questions about the recipient's career growth and skills without asking questions about hiring or recruitment.
                                    - Ensure the message is conversational, friendly, and feels personalized to the recipient’s background.
                                    - Vary the tone and structure to avoid repetition.
                                \n\n`;

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
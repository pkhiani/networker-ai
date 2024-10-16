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
                    let prompt = `Create a concise, professional, and friendly LinkedIn message for initiating a brief chat, limited to 200 characters. Personalize the message using the recipient's first name, and prioritize their most recent role at the company. If the recipient is a recruiter, ask engaging questions about their experience at the company, such as what makes an ideal candidate, what it takes to be part of the company, or what the company culture is like. If the recipient is not a recruiter, focus entirely on acknowledging their career growth, skills, and achievements, without asking any questions. Mention your own background as "${userOneliner}" in a way that naturally complements their profile. Ensure the message sounds human-crafted and unique, ending with a note of thanks.

                                    ### Guidelines:
                                    1. **Personalized Greeting**: Start with the recipient’s first name.
                                    2. **For Recruiters**: Ask thoughtful questions about the company, culture, or qualities they look for in candidates. Do not reference any previous recruiting roles.
                                    3. **For Non-Recruiters**: Reference specific aspects of their career growth, skills, and achievements, without asking questions.
                                    4. **Relate to Your Background**: Connect your own experience ("${userOneliner}") to their role at the company or industry.
                                    5. **Varied Structure**: Ensure the structure and tone of the message varies to avoid repetitive outputs.
                                    6. **Close with Appreciation**: End with a warm thank you and an invitation for a brief chat.

                                    ### Output Format:
                                    One short, friendly, and varied LinkedIn message that sounds authentic and natural, not exceeding 200 characters.

                                    ### Example Messages for Recruiters (Engaging Questions):
                                    1. "Hey [First Name], your work at [company] in [industry] is impressive! I'd love to know what makes an ideal candidate there. I’m a ${userOneliner}, and would love to chat. Thanks!"
                                    
                                    2. "Hi [First Name], I’ve always admired [company]. Could you share what it takes to be part of the team there? As a ${userOneliner}, I'd love to connect and learn more. Appreciate your time!"

                                    3. "Hey [First Name], I noticed you're at [company]—what's the company culture like? As a ${userOneliner}, I’m really interested in learning more. Thanks for considering a chat!"

                                    4. "Hello [First Name], working at [company] must be exciting! What qualities do you look for in candidates? I’m a ${userOneliner} and would love to connect for a brief chat. Thanks!"

                                    5. "Hey [First Name], I noticed you're at [company]—what’s the company culture like? I’m a ${userOneliner} and would love to connect and learn more. Thanks for considering a chat!"

                                    6. "Hi [First Name], your role at [company] sounds exciting! What makes an ideal candidate for your team? As a ${userOneliner}, I’d love to hear more and connect. Appreciate your time!"

                                    ### Example Messages for Non-Recruiters (No Questions, Specific Career Growth, Skills, and Achievements Focus):
                                    1. "Hi [First Name], your growth in [specific skill] at [company] is impressive, especially your work on [specific project/achievement]. I’m a ${userOneliner} and would love to hear more. Thanks!"

                                    2. "Hello [First Name], your achievements in [industry] at [company], like [specific accomplishment], caught my attention. I’m a ${userOneliner}, and I’d love to chat about your journey. Thanks!"

                                    3. "Hey [First Name], your role at [company] really stands out, especially your work in [specific skill or project]. As a ${userOneliner}, I’d love to hear more about your career. Thanks!"

                                    4. "Hi [First Name], your contribution to [specific project] at [company] in [industry] shows remarkable growth. I’m a ${userOneliner}, and I’d love to connect to learn more about your journey. Thanks!"

                                    5. "Hey [First Name], your success in developing [specific skill] at [company] is impressive. As a ${userOneliner}, I’d love to hear more about how you achieved that. Thanks!"

                                    6. "Hi [First Name], the work you’ve done at [company] on [specific project or skill] is inspiring. I’m a ${userOneliner}, and I'd love to connect and discuss your path. Thanks!"

                                    7. "Hello [First Name], your growth in [specific skill or project] at [company] has been incredible. I’m a ${userOneliner}, and I’d love to hear more about your achievements. Thanks!"

                                    8. "Hey [First Name], your work at [company] in [specific skill or industry] is impressive, especially [specific achievement]. I’m a ${userOneliner}, and I’d love to chat. Thanks!"

                                    9. "Hi [First Name], your journey in [industry] and your success at [company], particularly in [specific project], really caught my eye. I’m a ${userOneliner}, and I’d love to connect. Thanks!"

                                    10. "Hey [First Name], your work at [company] in [specific skill] really stands out. I’m a ${userOneliner}, and I’d love to hear more about how you’ve grown into your role. Thanks!"

                                    ### Notes:
                                    - For recruiters, reference only their most current role and ask thoughtful questions about the company or qualities they look for in candidates. Give only one output.
                                    - For non-recruiters, **no questions should be asked**. Instead, reference entirely on their career growth, skills, and achievements.
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
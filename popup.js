document.addEventListener("DOMContentLoaded", () => {
    const ProfileBtn = document.getElementById("profileIcon");

    // Open profile.html in a new tab for "Create Profile" and "Edit Profile" actions
    ProfileBtn.addEventListener("click", () => {
        chrome.tabs.create({ url: chrome.runtime.getURL("profile.html") });
    });

});

// Wait until the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Load the saved purpose when the popup is opened
    chrome.storage.sync.get(['userPurpose'], function(result) {
        if (result.userPurpose) {
            document.getElementById('userPurpose').value = result.userPurpose;
        }
    });

    // Save the selected option from the purpose dropdown when changed
    document.getElementById('purposeDropdown').addEventListener('change', function() {
        const purpose = this.value; // Get selected option

        // Save the selected purpose using Chrome's storage API
        chrome.storage.sync.set({ userPurpose: purpose }, function() {
            if (chrome.runtime.lastError) {
                console.error('Error saving purpose:', chrome.runtime.lastError);
            } else {
                console.log('Purpose saved:', purpose);
                // Optionally alert the user
                // alert('Your purpose has been saved!');
            }
        });
    });
});

// Clear the dropdown choice when the popup is closed
document.addEventListener('beforeunload', function() {
    document.getElementById('userPurpose').value = ""; // Clear the dropdown selection
    chrome.storage.sync.remove('userPurpose'); // Optionally remove the saved purpose
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
    chrome.storage.sync.get(['userPurpose'], function(result) {
        const userPurpose = result.userPurpose;

        // Check if the one-liner is empty
        if (!userPurpose) {
            loadingMessage.style.display = 'none';
            generatedMessage.value = "Please select a purpose"; // Display message if no one-liner is provided
            return; // Exit the function early
        }

        // Check if the current tab is a LinkedIn page
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentUrl = tabs[0].url; // Get the URL of the active tab

            if (!currentUrl.includes("linkedin.com/in")) {
                loadingMessage.style.display = 'none';
                generatedMessage.value = "Please open a LinkedIn Profile"; // Display message if not on LinkedIn
                return; // Exit the function early
            }

            // Get the current tab and send a message to the content script
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                files: ['profile.js', 'contentScript.js']
            }, () => {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: 'getProfileDetails',
                    profileAction: 'getProfileData'
                }, async (response) => {
                    // Check if response is defined and has properties
                    if (chrome.runtime.lastError) {
                        console.error('Error sending message:', chrome.runtime.lastError);
                        return; // Exit if there's an error
                    }
        
                    const experienceDetails = response?.experience || []; // Default to empty array if not found
                    const profileDetails = response?.profile || {}; // Default to empty object if not found

                    console.log('Received Experience Details:', experienceDetails);
                    console.log('Received Profile Details:', profileDetails);
                                    
                    // Initialize the prompt, including the user's one-liner
                    let prompt = `Create a concise, professional, and friendly LinkedIn message for initiating a brief chat, limited to 200 characters. Personalize the message using the recipient's first name, and prioritize their most recent role at the company. If the recipient is a recruiter, ask engaging questions about their experience at the company, such as what makes an ideal candidate, what it takes to be part of the company, or what the company culture is like. If the recipient is not a recruiter, focus entirely on acknowledging their career growth, skills, and achievements. Mention your own background in a way that naturally complements their profile. Ensure the message sounds human-crafted and unique, ending with a note of thanks.

                                    ### Guidelines:
                                    1. **Personalized Greeting**: Start with the recipient’s first name.
                                    2. **For Recruiters**: Ask thoughtful questions about the company, culture, or qualities they look for in candidates. Do not reference any previous recruiting roles.
                                    3. **For Non-Recruiters**: Reference specific aspects of their career growth, skills, and achievements.
                                    4. **Relate to Your Background**: Connect your intention for reaching out (${userPurpose}) to their work experience, projcts / startups they are working on, role or industry using your own details such as your **skills** (${profileDetails.skills}), **work experience** (${profileDetails.workExperience}), **education** (${profileDetails.education}), and **notable projects/achievements** (${profileDetails.projectsAchievements}).
                                    5. **Error Handling**: If a detail from the user’s profile is minimal or missing, ensure the message remains relevant and personable without forced references.
                                    6. **Distinct Structure and Tone**: Each output should feature unique phrasing and sentence structure to avoid repetition, with a warm, professional, and conversational tone that reflects genuine interest.
                                    7. **Message Length and Structure**: Keep the message clear, with a single idea per sentence, and avoid generic phrases. Messages should feel as though they were individually typed.
                                    8. **Close with Appreciation**: End with a warm thank you and an invitation for a brief chat.

                                    ### Notes:
                                    - For recruiters, reference only their most current role and ask thoughtful questions about the company or qualities they look for in candidates. Give only one output.
                                    - For non-recruiters, Reference entirely on their career growth, skills, and achievements.
                                    - Ensure the message is conversational, friendly, and feels personalized to the recipient’s background.
                                    - Vary the tone and structure to avoid repetition.
                                    - For ambiguous purposes, select the tone that feels most relevant to the recipient’s background.

                                    ### Output Format:
                                    One short, friendly, and varied LinkedIn message that sounds authentic and natural, not exceeding 200 characters.

                                    ### Example Messages for Recruiters (Engaging Questions):
                                    1. "Hey [First Name], your work at [company] in [industry] is impressive! I'd love to know what makes an ideal candidate there. I’m a ${profileDetails.workExperience}, and would love to chat. Thanks!"
                                    2. "Hi [First Name], I’ve always admired [company]. Could you share what it takes to be part of the team there? As a ${profileDetails.workExperience}, I'd love to connect and learn more. Appreciate your time!"
                                    3. "Hey [First Name], I noticed you're at [company]—what's the company culture like? As a ${profileDetails.workExperience}, I’m really interested in learning more. Thanks for considering a chat!"
                                    4. "Hello [First Name], working at [company] must be exciting! What qualities do you look for in candidates? I’m a ${profileDetails.workExperience} and would love to connect for a brief chat. Thanks!"
                                    5. "Hey [First Name], I noticed you're at [company]—what’s the company culture like? I’m a ${profileDetails.workExperience} and would love to connect and learn more. Thanks for considering a chat!"
                                    6. "Hi [First Name], your role at [company] sounds exciting! What makes an ideal candidate for your team? As a ${profileDetails.workExperience}, I’d love to hear more and connect. Appreciate your time!"

                                    ### Example Messages for Non-Recruiters (Specific Career Growth, Skills, and Achievements Focus):`;

                                    switch (userPurpose) {
                                        case 'careerAdvice':
                                            prompt += `
                                            1. "Hi [First Name], I’m inspired by your path from [previous role/field] to your current role at [company]. As I’m building my own expertise in [user skill, e.g., data analytics], any guidance you could share would be invaluable!"
                                            2. "Hello [First Name], your growth in [industry] at [company] really resonates! I’m working on [specific project, e.g., a machine learning tool for e-commerce], and I’d love to hear about any lessons learned from your journey."
                                            3. "Hey [First Name], I admire your strategic insights at [company]! As someone exploring [related user field, e.g., product strategy], I'd appreciate any advice you might have on progressing in this area."
                                            4. "Hi [First Name], as someone also involved in [specific industry or field, e.g., SaaS product development], I’d love to learn how your time at [company] shaped your approach. Thank you for considering a quick chat!"
                                            5. "Hello [First Name], your leadership journey at [company] is so inspiring. I’m currently enhancing my [user skill, e.g., project management] and would value any advice on navigating similar career steps!"`;
                                            break;
                                        case 'networking':
                                            prompt += `
                                            1. "Hi [First Name], your recent work on [specific project or initiative, e.g., the AI-driven customer insights tool] at [company] caught my attention! I’d love to connect and stay in touch as I explore similar fields."
                                            2. "Hello [First Name], your role in [specific field, e.g., cloud architecture] at [company] aligns with my own work in [related field, e.g., cloud-based applications]. Let’s connect to share insights and ideas!"
                                            3. "Hey [First Name], I’m impressed by your contributions to [industry] at [company]. As someone involved in [specific user field or skill, e.g., UX research], I’d love to connect and hear more about your journey."
                                            4. "Hi [First Name], your impact on [specific area, e.g., sustainable energy initiatives] at [company] is inspiring! As I work in [related field, e.g., environmental tech], I’d love to stay connected."
                                            5. "Hello [First Name], your achievements in [specific skill or role, e.g., data security at enterprise scale] at [company] are amazing. Let’s connect—I’m interested in similar areas and would enjoy staying in touch!"`;
                                            break;
                                        case 'jobInquiry':
                                            prompt += `
                                            1. "Hi [First Name], your role at [company] sounds incredible! Could you share what qualities the team values most in a candidate? I’m exploring opportunities and would really appreciate your perspective."
                                            2. "Hey [First Name], I’m interested in [specific department, e.g., product operations] at [company] and would love any insights into what sets successful candidates apart. Thank you for considering a quick chat!"
                                            3. "Hi [First Name], I’m looking into roles at [company] in [specific industry, e.g., FinTech]. I’d appreciate any insights into the company culture and what you think defines a great candidate!"
                                            4. "Hello [First Name], I noticed your experience in [specific field, e.g., cybersecurity] at [company]. As I explore similar roles, I’d love to know what makes an ideal candidate from your perspective."
                                            5. "Hi [First Name], I’m researching positions in [industry] and would appreciate your perspective on [company]. Any insight on key qualities valued there would be fantastic. Thank you!"`;
                                            break;
                                        case 'projectCollaboration':
                                            prompt += `
                                            "Hi [First Name], I came across your work on [specific project, e.g., AI-driven customer segmentation], and it really resonates with some of my recent projects on [user project, e.g., predictive analytics]. Would you be open to connecting to see if there’s room for collaboration?"
                                            "Hello [First Name], I’ve been following your work in [specific area, e.g., IoT for healthcare] at [company], and I think our experiences might line up in some interesting ways. Let’s connect and see where our projects could intersect!"
                                            "Hey [First Name], I noticed your work on [specific project, e.g., environmental data analysis] at [company]. With my background in [related field, e.g., data science for sustainability], I’d love to chat about any ways we might team up."
                                            "Hi [First Name], your focus on [specific field, e.g., blockchain solutions] is impressive! I’m working on [user project, e.g., blockchain security], and I’d be interested in seeing if there are ways for us to collaborate."
                                            "Hello [First Name], I’ve been exploring projects in [specific field, e.g., AI in education], and the work you’re doing at [company] really caught my attention. Would you be open to connecting and chatting about possible collaboration?"
                                            "Hi [First Name], I’m really interested in your work on [specific project, e.g., AI-driven customer segmentation]. I’ve been working on [user project, e.g., predictive analytics]—maybe we could find some areas to collaborate!"
                                            "Hello [First Name], your focus on [specific area, e.g., IoT for healthcare] aligns with my background in [related user field, e.g., data integration]. I’d love to connect and explore if there’s potential for joint efforts."
                                            "Hey [First Name], I see a strong overlap between your work on [specific project, e.g., environmental data analysis] and my experience in [related field, e.g., data science for sustainability]. Let’s connect to discuss potential collaboration!"
                                            "Hi [First Name], I’m impressed by your expertise in [specific field, e.g., blockchain solutions] at [company]. I’m currently exploring similar projects, and it’d be great to connect and brainstorm some ideas together."
                                            "Hello [First Name], as someone working in [specific field, e.g., AI in education], your projects at [company] stood out to me. I’d love to connect and see if there’s a way we can team up on something impactful!"
                                            "Hi [First Name], I noticed you’re working on [specific project]. I’ve got a similar interest in [user’s project field], and it seems like we might have some shared goals. Would you be open to exploring possible collaboration?"
                                            "Hey [First Name], I’ve been following your progress in [specific area, e.g., renewable energy solutions]. I’m working on a project in [related field], and I think our insights might complement each other well."
                                            "Hello [First Name], your recent work in [specific field, e.g., healthcare data analytics] is inspiring. I’m tackling something similar on my end, and I think there’s room for us to collaborate in a meaningful way."`;
                                            break;
                                        default:
                                            prompt += ` **For Other Purposes**:
                                            1. "Hey [First Name], your leadership in [recipient achievement, e.g., digital transformation] at [company] is inspiring! I’m working in [user work experience, e.g., change management], and would love to connect."
                                            2. "Hi [First Name], your work at [company] in [specific field, e.g., sustainable tech] really caught my attention. I’m building up my skills in [related user skill, e.g., eco-friendly design] and would love to connect!"
                                            3. "Hello [First Name], your achievements in [specific area, e.g., cloud security] at [company] are amazing! I’m involved in [user project or skill, e.g., SaaS security] and would enjoy staying connected."
                                            4. "Hi [First Name], I saw your work at [company] in [specific field, e.g., logistics optimization], which aligns with my experience in [related user field, e.g., supply chain management]. Let’s connect!"
                                            5. "Hey [First Name], your innovative approach at [company] in [specific field, e.g., machine learning for healthcare] is inspiring. I’m exploring similar areas and would love to connect and learn more!"`;
                                    }

                    if (experienceDetails.length > 0) {
                        // Construct the prompt using experience details
                        experienceDetails.forEach(exp => {
                            prompt += `Recipient's experience details:\nName: ${exp.name}\nTitle: ${exp.title}\nCompany: ${exp.company}\nDescription: ${exp.description}\n\n`;
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
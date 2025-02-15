document.addEventListener("DOMContentLoaded", () => {
    const saveProfileBtn = document.getElementById("saveProfile");

    // Form fields
    const nameInput = document.getElementById("name");
    const workExperienceInput = document.getElementById("workExperience");
    const educationInput = document.getElementById("education");
    const skillsInput = document.getElementById("skills");
    const projectsAchievementsInput = document.getElementById("projectsAchievements");

    // Load existing profile data if available
    function loadProfileData() {
        chrome.storage.local.get('profileData', (result) => {
            const savedData = result.profileData || {};
            nameInput.value = savedData.name || "";
            workExperienceInput.value = savedData.workExperience || "";
            educationInput.value = savedData.education || "";
            skillsInput.value = savedData.skills || "";
            projectsAchievementsInput.value = savedData.projectsAchievements || "";
        });
    }

    loadProfileData(); // Load data on page load

    // Save profile data to chrome.storage.local when "Save Profile" is clicked
    saveProfileBtn.addEventListener("click", () => {
        const profileData = {
            name: nameInput.value,
            workExperience: workExperienceInput.value,
            education: educationInput.value,
            skills: skillsInput.value,
            projectsAchievements: projectsAchievementsInput.value
        };

        // Use chrome.storage.local to save profile data
        chrome.storage.local.set({ profileData: profileData }, () => {
            console.log('Profile Data Saved:', profileData); // Log saved data
            alert("Profile saved!");
        });
    });
});

const clientId = '78nj2vdfpzgwi8'; // Replace with your LinkedIn Client ID
const redirectUri = 'https://pcoeackmidgmiogcbhocddhfbjalhdik.chromiumapp.org/linkedin_callback';
const scope = 'profile'; // Specify required permissions
const state = 'sdfiugsdfhkionmdndsfjksd';

function loginWithLinkedIn() {
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    chrome.identity.launchWebAuthFlow({
        url: authUrl,
        interactive: true
    }, function (redirectUrl) {
        if (chrome.runtime.lastError || !redirectUrl) {
            console.error(chrome.runtime.lastError);
            return;
        }

        // Extract the authorization code from the redirect URL
        const urlParams = new URLSearchParams(new URL(redirectUrl).search);
        const authorizationCode = urlParams.get('code');

        if (authorizationCode) {
            exchangeAuthorizationCodeForAccessToken(authorizationCode);
        }
    });
}

async function exchangeAuthorizationCodeForAccessToken(authorizationCode) {
    const clientId = '78nj2vdfpzgwi8'; // Replace with your LinkedIn Client ID
    const clientSecret = ''; // Replace with your LinkedIn Client Secret
    const redirectUri = 'https://pcoeackmidgmiogcbhocddhfbjalhdik.chromiumapp.org/linkedin_callback'; 

    try {
        const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: authorizationCode,
                redirect_uri: redirectUri,
                client_id: clientId,
                client_secret: clientSecret
            })
        });

        const data = await response.json();
        if (data.access_token) {
            // Save the access token to Chrome storage for later use
            chrome.storage.sync.set({ accessToken: data.access_token }, function () {
                console.log("Access token saved");
                getAccessToken((token) => {
                    console.log('Access Token:', token);
                    // Use this token to make authenticated API requests
                });
            });
        } else {
            console.error('Failed to get access token:', data);
        }
    } catch (error) {
        console.error('Error exchanging authorization code for access token:', error);
    }
}

function getAccessToken(callback) {
    chrome.storage.sync.get(['accessToken'], function (result) {
        callback(result.accessToken);
    });
}

document.getElementById('loginButton').addEventListener('click', loginWithLinkedIn);




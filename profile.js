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


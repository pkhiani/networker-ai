document.addEventListener("DOMContentLoaded", () => {
    const saveProfileBtn = document.getElementById("saveProfile");

    // Form fields
    const nameInput = document.getElementById("name");
    const workExperienceInput = document.getElementById("workExperience");
    const educationInput = document.getElementById("education");

    // Load existing profile data if available
    function loadProfileData() {
        const savedData = JSON.parse(localStorage.getItem("profileData"));
        if (savedData) {
            nameInput.value = savedData.name || "";
            workExperienceInput.value = savedData.workExperience || "";
            educationInput.value = savedData.education || "";
        }
    }

    loadProfileData(); // Load data on page load

    // Save profile data to localStorage when "Save Profile" is clicked
    saveProfileBtn.addEventListener("click", () => {
        const profileData = {
            name: nameInput.value,
            workExperience: workExperienceInput.value,
            education: educationInput.value
        };
        localStorage.setItem("profileData", JSON.stringify(profileData));
        alert("Profile saved!");
    });
});

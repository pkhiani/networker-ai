// contentScript.js

// Function to extract LinkedIn Experience details
function getLinkedInExperience() {
  const experiences = [];

  let experienceSection = document.querySelector("#profile-content > div > div.scaffold-layout.scaffold-layout--breakpoint-md.scaffold-layout--main-aside.scaffold-layout--reflow.pv-profile.pvs-loader-wrapper__shimmer--animate > div > div > main")
  
  // Select the experience section by looking for the appropriate class
  //   const experienceSection = Array.from(document.querySelectorAll("section"))
  //   .find(section => section.innerText.includes("Experience")); // Find the section containing the word "Experience"

    experienceSection = Array.from(document.querySelectorAll("div"))
        .find(section => section.innerText.toLowerCase().includes("experience"));

  // Check if the experience section exists
  if (!experienceSection) {
      console.log("Experience section not found.");
      return experiences; // Return empty array if not found
  }

  // Select all experience items within the experience section
  const experienceItems = experienceSection.querySelectorAll('.artdeco-list__item');

  console.log(`Found ${experienceItems.length} experience items.`); // Log the number of experience items

  const nameElement = document.querySelector('a[id^="ember"] h1.text-heading-xlarge'); // Select the <h1> within the <a>

  experienceItems.forEach((item, index) => {
      if (index >= 10) return; // Stop after 10 items
      // Extract name
      const titleElement = item.querySelector('.display-flex.align-items-center .t-bold span[aria-hidden="true"]'); // Select job title
      const companyElement = item.querySelector('span.t-normal'); // Select company name with job type
      const descriptionElement = item.querySelector('.inline-show-more-text--is-collapsed'); // Select description

      const name = nameElement ? nameElement.innerText.trim() : 'Name not found';
      const title = titleElement ? titleElement.innerText.trim() : 'Title not found';
      const company = companyElement ? companyElement.innerText.trim() : 'Company not found';
      const description = descriptionElement ? descriptionElement.innerText.trim() : 'Description not found';

      console.log(`Name: "${name}", Experience ${index + 1}: Title: "${title}", Company: "${company}", Description: "${description}"`); // Log extracted details

      experiences.push({ name, title, company, description }); // Add extracted details to experiences array
  });

  if (experiences.length === 0) {
      console.log("No experience details found.");
  } else {
      console.log("Successfully extracted experience details:", experiences); // Log the array of experiences
  }

  return experiences; // Return the array of experience details
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProfileDetails') {
      const experienceDetails = getLinkedInExperience();
      sendResponse({ experience: experienceDetails });
  }
});

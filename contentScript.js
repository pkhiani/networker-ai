// Helper function to wait for elements to load
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const interval = 100;
      let waited = 0;
      const checkExist = setInterval(() => {
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(checkExist);
          resolve(element);
        } else if (waited >= timeout) {
          clearInterval(checkExist);
          reject(null);
        }
        waited += interval;
      }, interval);
    });
  }
  
  async function getLinkedInProfileDetails() {
    try {
      // Wait for the elements to load
      const nameElement = await waitForElement("h1.text-heading-xlarge.inline.t-24.v-align-middle.break-words");
      const roleElement = await waitForElement(".display-flex.flex-wrap.align-items-center.full-height .mr1.t-bold span");
      const companyElement = await waitForElement(".t-14.t-normal span");
  
      // Extract and trim the text
      const name = nameElement.innerText.trim();
      const company = companyElement.innerText.trim();
      const role = roleElement.innerText.trim();
  
      // Log the extracted details for debugging
      console.log(`Name: ${name}, Company: ${company}, Role: ${role}`);
  
      return { name, role, company };
    } catch (error) {
      console.error("Could not extract profile details.");
      return { name: null, role: null, company: null };
    }
  }
  
  // Listen for messages from the extension
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getProfileDetails") {
      getLinkedInProfileDetails().then(profileDetails => {
        sendResponse(profileDetails);
      });
      // Return true to indicate an asynchronous response will be sent
      return true;
    }
  });
  
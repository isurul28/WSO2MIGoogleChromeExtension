// background.js
// This script runs in the background and sets up the side panel.

// Listens for the extension's installation event.
chrome.runtime.onInstalled.addListener(() => {
  // Sets the default side panel for all browser contexts.
  // This means the side panel will be available on any tab.
  chrome.sidePanel.setOptions({
    path: 'sidepanel.html', // Specifies the HTML file to load in the side panel
    enabled: true // Ensures the side panel is enabled by default
  });
});

// Optional: You can add more logic here if you want to control when the side panel is shown
// For example, based on the active tab's URL.
// For this simple request, making it always available is sufficient.

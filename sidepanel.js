// sidepanel.js
// This script runs within the side panel HTML.

document.addEventListener('DOMContentLoaded', async () => {
    const activeCountCard = document.getElementById('activeCountCard');
    const faultyCountCard = document.getElementById('faultyCountCard');
    const activeCountDisplay = document.getElementById('activeCountDisplay');
    const faultyCountDisplay = document.getElementById('faultyCountDisplay');
    const faultyListCard = document.getElementById('faultyListCard');
    const faultyListDisplay = document.getElementById('faultyListDisplay');
    const errorMessageDiv = document.getElementById('errorMessage');
    const loadingSpinner = document.getElementById('loading');

    // Function to hide all feedback elements and show a specific one
    function showFeedback(elementToShow, message = '') {
        loadingSpinner.classList.add('hidden');
        activeCountCard.classList.add('hidden');
        faultyCountCard.classList.add('hidden');
        faultyListCard.classList.add('hidden');
        errorMessageDiv.classList.add('hidden');

        if (elementToShow) {
            elementToShow.classList.remove('hidden');
            if (elementToShow === errorMessageDiv) {
                errorMessageDiv.textContent = message;
            }
        }
    }

    // Initially show loading spinner
    showFeedback(loadingSpinner);

    try {
        // --- Step 1: Call the login API to get an access token ---
        const loginUrl = 'http://localhost:9206/management/login';
        // Base64 encoded
        const basicAuthHeader = 'Basic xxxx==';

        const loginResponse = await fetch(loginUrl, {
            method: 'GET',
            headers: {
                'Authorization': basicAuthHeader
            }
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed! HTTP error! Status: ${loginResponse.status}`);
        }

        const loginData = await loginResponse.json();
        // Assuming the access token is in a field named 'AccessToken'.
        // Adjust this if your API returns the token under a different key.
        const accessToken = loginData.AccessToken; 

        if (!accessToken) {
            throw new Error('Access token not found in login response.');
        }

        // --- Step 2: Use the access token to call the applications API ---
        const applicationsUrl = 'http://localhost:9206/management/applications';
        const bearerAuthHeader = `Bearer ${accessToken}`;

        const applicationsResponse = await fetch(applicationsUrl, {
            method: 'GET',
            headers: {
                'Authorization': bearerAuthHeader
            }
        });

        if (!applicationsResponse.ok) {
            throw new Error(`Failed to fetch applications! HTTP error! Status: ${applicationsResponse.status}`);
        }

        const applicationsData = await applicationsResponse.json();

        // --- Step 3: Extract and display activeCount, faultyCount, and faultyList ---
        const activeCount = applicationsData.activeCount;
        const faultyCount = applicationsData.faultyCount;
        const faultyList = applicationsData.faultyList;

        if (typeof activeCount !== 'undefined' && typeof faultyCount !== 'undefined') {
            activeCountDisplay.textContent = activeCount;
            faultyCountDisplay.textContent = faultyCount;

            // Clear previous list items
            faultyListDisplay.innerHTML = ''; 

            // Display faultyList if it exists and is an array
            if (Array.isArray(faultyList) && faultyList.length > 0) {
                faultyList.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('faulty-item'); // Add styling class

                    // Create a clickable span for the faulty item's name
                    const itemName = document.createElement('span');
                    itemName.classList.add('faulty-item-name');
                    itemName.textContent = item.name || 'Unnamed Faulty Item'; // Fallback for unnamed items
                    itemName.setAttribute('tabindex', '0'); // Make it focusable for accessibility
                    itemName.setAttribute('role', 'button'); // Indicate it's a button for accessibility
                    listItem.appendChild(itemName);

                    // Create a container for artifacts, initially hidden
                    const artifactsContainer = document.createElement('div');
                    artifactsContainer.classList.add('faulty-artifacts-container');
                    
                    // Populate artifacts content
                    if (item.artifacts && typeof item.artifacts === 'object') {
                        const artifactsPre = document.createElement('pre');
                        artifactsPre.textContent = JSON.stringify(item.artifacts, null, 2);
                        artifactsContainer.appendChild(artifactsPre);
                    } else if (item.artifacts) {
                        // Handle case where artifacts exist but are not an object (e.g., string, number)
                        const artifactsDiv = document.createElement('div');
                        artifactsDiv.textContent = `Artifacts: ${JSON.stringify(item.artifacts)}`;
                        artifactsContainer.appendChild(artifactsDiv);
                    } else {
                        // Display a message if no artifacts
                        const noArtifactsDiv = document.createElement('div');
                        noArtifactsDiv.textContent = 'No artifacts for this item.';
                        artifactsContainer.appendChild(noArtifactsDiv);
                    }
                    
                    listItem.appendChild(artifactsContainer); // Add the artifacts container to the list item

                    // Add click event listener to the item name
                    itemName.addEventListener('click', () => {
                        artifactsContainer.classList.toggle('visible'); // Toggle 'visible' class
                    });

                    // Add keydown listener for accessibility (Enter/Space to toggle)
                    itemName.addEventListener('keydown', (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault(); // Prevent default action (e.g., scrolling for space)
                            artifactsContainer.classList.toggle('visible');
                        }
                    });

                    faultyListDisplay.appendChild(listItem);
                });
                faultyListCard.classList.remove('hidden'); // Show the faulty list card
            } else if (Array.isArray(faultyList) && faultyList.length === 0) {
                // If the list is empty, show a message
                const listItem = document.createElement('li');
                listItem.classList.add('faulty-item');
                const messageSpan = document.createElement('span');
                messageSpan.textContent = "No faulty applications found.";
                listItem.appendChild(messageSpan);
                faultyListDisplay.appendChild(listItem);
                faultyListCard.classList.remove('hidden');
            } else {
                // If faultyList is not an array or undefined, log a warning
                console.warn("faultyList not found or not an array in the API response.");
                faultyListCard.classList.add('hidden'); // Ensure it's hidden if no valid list
            }

            // Show the count cards
            loadingSpinner.classList.add('hidden');
            errorMessageDiv.classList.add('hidden');
            activeCountCard.classList.remove('hidden');
            faultyCountCard.classList.remove('hidden');

        } else {
            throw new Error('Required counts (activeCount or faultyCount) not found in API response.');
        }

    } catch (error) {
        // Catch any errors during the fetch operation or JSON parsing
        console.error('Failed to fetch API data:', error);
        // Display an informative error message to the user
        showFeedback(errorMessageDiv, `Error: ${error.message}. Please ensure both API endpoints are reachable and credentials are correct.`);
    }
});

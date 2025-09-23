// Step 1: First expand all dropdowns (you already did this)
document.querySelectorAll('[aria-expanded="false"]').forEach(el => el.click());

// Step 2: Wait 2 seconds, then run this to capture all content
setTimeout(() => {
    let allRules = {};

    // Find all expanded sections (now aria-expanded="true")
    let expandedSections = document.querySelectorAll('[aria-expanded="true"]');

    expandedSections.forEach(section => {
        // Get the header text (league name)
        let headerText = section.textContent.trim();

        // Find the content container - it's usually the next sibling
        let contentElement = section.nextElementSibling;

        // If no next sibling, try parent's next sibling
        if (!contentElement) {
            contentElement = section.parentElement.nextElementSibling;
        }

        // If still no content, try to find a div that follows
        if (!contentElement) {
            let parent = section.parentElement;
            let siblings = Array.from(parent.parentElement.children);
            let currentIndex = siblings.indexOf(parent);
            if (currentIndex !== -1 && currentIndex < siblings.length - 1) {
                contentElement = siblings[currentIndex + 1];
            }
        }

        if (contentElement && contentElement.textContent) {
            let content = contentElement.textContent.trim();

            // Only save if we have substantial content
            if (content.length > 50 && !content.includes('Updated')) {
                allRules[headerText] = content;
                console.log(`Found rules for: ${headerText} (${content.length} chars)`);
            }
        }
    });

    // Alternative: Just get all the visible text after expansion
    if (Object.keys(allRules).length < 10) {
        console.log("Trying alternative method...");

        // Get the main content area
        let mainContent = document.querySelector('[role="main"]') || document.body;
        let fullText = mainContent.innerText;

        // Parse by league headers
        let lines = fullText.split('\n');
        let currentLeague = null;
        let currentContent = [];

        lines.forEach(line => {
            // Check if this is a league header
            if (line.includes('Updated') && line.length < 100) {
                // Save previous league
                if (currentLeague && currentContent.length > 0) {
                    allRules[currentLeague] = currentContent.join('\n');
                }
                // Start new league
                currentLeague = line;
                currentContent = [];
            } else if (currentLeague && line.trim()) {
                // Skip navigation and footer text
                if (!line.includes('Copyright') &&
                    !line.includes('Home') &&
                    !line.includes('General Meetings') &&
                    !line.includes('CBOA Library')) {
                    currentContent.push(line);
                }
            }
        });

        // Save last league
        if (currentLeague && currentContent.length > 0) {
            allRules[currentLeague] = currentContent.join('\n');
        }
    }

    // Copy to clipboard
    let jsonString = JSON.stringify(allRules, null, 2);
    copy(jsonString);

    console.log("========================================");
    console.log(`Successfully captured ${Object.keys(allRules).length} leagues!`);
    console.log("Content has been copied to your clipboard.");
    console.log("Paste it into a file called 'cboa_rules.json'");
    console.log("========================================");

    // Also log the leagues we found
    Object.keys(allRules).forEach((league, i) => {
        console.log(`${i+1}. ${league}`);
    });

    return allRules;
}, 2000);
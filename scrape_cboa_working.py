"""
CBOA Rules Scraper - Working Version
This version properly clicks dropdowns and extracts the revealed content
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from datetime import datetime

def setup_driver(headless=False):
    """Setup Chrome driver"""
    chrome_options = Options()

    if headless:
        chrome_options.add_argument("--headless")

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    return driver

def scrape_rules():
    """Main scraping function that clicks dropdowns and extracts content"""

    print("Starting CBOA Rules Scraper...")
    print("This will open Chrome and click through all dropdowns")
    print("-" * 60)

    driver = setup_driver(headless=False)  # Run visible so you can see it working
    all_rules = {}

    try:
        # Navigate to the page
        url = "https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications"
        print(f"Navigating to {url}")
        driver.get(url)

        # Wait for page to load
        time.sleep(5)
        print("Page loaded. Finding dropdowns...")

        # Find all elements containing "Updated" - these are our dropdown headers
        dropdown_headers = driver.find_elements(By.XPATH, "//*[contains(text(), 'Updated')]")
        print(f"Found {len(dropdown_headers)} potential dropdowns")

        # Process each dropdown
        for i, header in enumerate(dropdown_headers):
            try:
                # Get the header text before clicking
                header_text = header.text.strip()

                # Skip if too long (not a header)
                if len(header_text) > 100:
                    continue

                print(f"\n[{i+1}/{len(dropdown_headers)}] Processing: {header_text[:60]}...")

                # Get the initial parent text (before expansion)
                parent = header.find_element(By.XPATH, "..")
                initial_text = parent.text

                # Scroll to element
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", header)
                time.sleep(0.5)

                # Click to expand
                try:
                    header.click()
                    print("  Clicked to expand...")
                except:
                    try:
                        driver.execute_script("arguments[0].click();", header)
                        print("  Clicked via JavaScript...")
                    except:
                        print("  Could not click")
                        continue

                # IMPORTANT: Wait for content to appear
                time.sleep(2)

                # Get the expanded text from the same parent element
                expanded_text = parent.text

                # Extract only the new content (expanded text minus initial text)
                if len(expanded_text) > len(initial_text):
                    # The content is everything after the header
                    content = expanded_text[len(header_text):].strip()

                    if content and len(content) > 50:  # Make sure we got substantial content
                        all_rules[header_text] = content
                        print(f"  [SUCCESS] Extracted {len(content)} characters")
                    else:
                        print(f"  [SKIP] No substantial content")
                else:
                    print(f"  [SKIP] No expansion detected")

            except Exception as e:
                print(f"  [ERROR] {str(e)}")
                continue

        # Alternative method: Get all content at once after clicking everything
        if len(all_rules) < 20:  # If we didn't get enough, try this
            print("\n" + "=" * 60)
            print("Trying alternative extraction method...")
            print("Clicking all dropdowns first...")

            # Click all dropdowns
            driver.execute_script("""
                let clicked = 0;
                document.querySelectorAll('*').forEach(elem => {
                    if (elem.innerText && elem.innerText.includes('Updated') && elem.innerText.length < 100) {
                        try {
                            elem.click();
                            clicked++;
                        } catch(e) {}
                    }
                });
                console.log('Clicked ' + clicked + ' elements');
            """)

            time.sleep(3)  # Wait for all to expand

            # Now extract all visible text organized by sections
            print("Extracting all expanded content...")

            # Get the full page text
            body_text = driver.find_element(By.TAG_NAME, "body").text

            # Parse it by looking for patterns
            lines = body_text.split('\n')
            current_league = None
            current_content = []

            for line in lines:
                # Check if this line is a league header (contains "Updated")
                if "Updated" in line and len(line) < 100:
                    # Save previous league if exists
                    if current_league and current_content:
                        content_text = '\n'.join(current_content)
                        if current_league not in all_rules:
                            all_rules[current_league] = content_text
                            print(f"  Added: {current_league[:50]}")

                    # Start new league
                    current_league = line.strip()
                    current_content = []
                elif current_league:
                    # Add to current league's content
                    current_content.append(line)

            # Don't forget the last one
            if current_league and current_content:
                content_text = '\n'.join(current_content)
                if current_league not in all_rules:
                    all_rules[current_league] = content_text

        # Save results
        print("\n" + "=" * 60)
        print(f"Extraction complete! Found {len(all_rules)} leagues/tournaments")

        # Save as JSON
        with open("cboa_rules_extracted.json", "w", encoding="utf-8") as f:
            json.dump(all_rules, f, indent=2, ensure_ascii=False)
        print("Saved to cboa_rules_extracted.json")

        # Save as Markdown
        save_as_markdown(all_rules)

        # List what we got
        if all_rules:
            print("\nExtracted rules for:")
            for i, league in enumerate(list(all_rules.keys())[:10], 1):
                print(f"  {i}. {league}")
            if len(all_rules) > 10:
                print(f"  ... and {len(all_rules) - 10} more")

        return all_rules

    except Exception as e:
        print(f"\nError: {str(e)}")
        import traceback
        traceback.print_exc()

    finally:
        print("\nClosing browser...")
        driver.quit()

def save_as_markdown(rules_dict):
    """Save as formatted markdown"""

    markdown = f"""# CBOA Complete Rules - All Leagues and Tournaments
*Extracted on: {datetime.now().strftime('%Y-%m-%d %H:%M')}*
*Source: https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications*

Total Leagues/Tournaments: {len(rules_dict)}

---

"""

    for league, content in rules_dict.items():
        markdown += f"## {league}\n\n"

        # Format content nicely
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if line:
                # Numbered items
                if line[0].isdigit() and len(line) > 2 and line[1] in '.)':
                    markdown += f"{line}\n"
                # Lettered items
                elif len(line) > 2 and line[0].lower() in 'abcdefghij' and line[1] in '.)':
                    markdown += f"  {line}\n"
                # Bullet points
                elif line.startswith('•') or line.startswith('-'):
                    markdown += f"{line}\n"
                # Regular text
                else:
                    markdown += f"{line}\n\n"

        markdown += "\n---\n\n"

    with open("cboa_rules_extracted.md", "w", encoding="utf-8") as f:
        f.write(markdown)
    print("Saved formatted version to cboa_rules_extracted.md")

if __name__ == "__main__":
    print("=" * 60)
    print("CBOA RULES SCRAPER - WORKING VERSION")
    print("=" * 60)

    rules = scrape_rules()

    if rules:
        print(f"\n[SUCCESS] Extracted {len(rules)} leagues/tournaments!")
    else:
        print("\n[FAILED] Could not extract rules")
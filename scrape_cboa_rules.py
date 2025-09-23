"""
CBOA Rules Modifications Scraper
This script uses Selenium to expand and extract all dropdown content from the CBOA rules page.
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
import time
import json
from datetime import datetime

def setup_driver():
    """Setup Chrome driver with options"""
    options = webdriver.ChromeOptions()
    # Run in headless mode (no browser window) - comment out to see browser
    # options.add_argument('--headless')
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('--disable-gpu')
    options.add_argument('--window-size=1920,1080')

    # Initialize driver
    driver = webdriver.Chrome(options=options)
    return driver

def scrape_cboa_rules():
    """Main function to scrape all rules from CBOA page"""

    print("Starting CBOA Rules Scraper...")
    driver = setup_driver()

    try:
        # Navigate to the page
        url = "https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications"
        print(f"Navigating to {url}")
        driver.get(url)

        # Wait for page to load
        time.sleep(3)

        # Dictionary to store all rules
        all_rules = {}

        # Find all expandable sections
        # Google Sites uses collapsible-content class
        print("Looking for expandable sections...")

        # Try multiple possible selectors for Google Sites dropdowns
        selectors = [
            "div[role='button'][aria-expanded]",
            "div.collapsible-item",
            "div.expand-item",
            ".expand-control",
            "div[data-expand]",
            "div.accordion-item",
            "[aria-controls]"
        ]

        expandable_sections = []
        for selector in selectors:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    print(f"Found {len(elements)} elements with selector: {selector}")
                    expandable_sections = elements
                    break
            except:
                continue

        # If no expandable sections found with CSS, try by text content
        if not expandable_sections:
            print("Trying to find sections by header text...")
            # Look for all h3 or h4 elements that might be dropdown headers
            headers = driver.find_elements(By.CSS_SELECTOR, "h3, h4, div.header")
            expandable_sections = [h for h in headers if "Updated" in h.text or "(" in h.text]
            print(f"Found {len(expandable_sections)} potential dropdown headers")

        if not expandable_sections:
            print("No expandable sections found. Attempting to get all visible content...")
            # Get all content even if dropdowns aren't detected
            all_content = driver.find_element(By.TAG_NAME, "body").text
            all_rules["Full Page Content"] = all_content
        else:
            # Process each expandable section
            for i, section in enumerate(expandable_sections):
                try:
                    # Get the title
                    title = section.text.split('\n')[0] if section.text else f"Section {i+1}"
                    print(f"\nProcessing: {title}")

                    # Check if already expanded
                    is_expanded = section.get_attribute("aria-expanded") == "true"

                    if not is_expanded:
                        # Scroll to element
                        driver.execute_script("arguments[0].scrollIntoView(true);", section)
                        time.sleep(0.5)

                        # Click to expand
                        try:
                            section.click()
                        except:
                            # Try JavaScript click if regular click fails
                            driver.execute_script("arguments[0].click();", section)

                        time.sleep(1)  # Wait for expansion animation

                    # Find the content area (usually the next sibling or child)
                    content = ""

                    # Try to find associated content
                    try:
                        # Try next sibling
                        content_element = driver.execute_script(
                            "return arguments[0].nextElementSibling;", section
                        )
                        if content_element:
                            content = content_element.text
                    except:
                        pass

                    # If no content found, try parent's text
                    if not content:
                        try:
                            parent = section.find_element(By.XPATH, "..")
                            content = parent.text
                            # Remove the title from content
                            content = content.replace(title, "", 1).strip()
                        except:
                            pass

                    # Store the content
                    if content:
                        all_rules[title] = content
                        print(f"  ✓ Extracted {len(content)} characters")
                    else:
                        print(f"  ✗ No content found")

                except Exception as e:
                    print(f"  ✗ Error processing section: {str(e)}")
                    continue

        # Save to JSON file
        output_file = "cboa_rules_complete.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_rules, f, indent=2, ensure_ascii=False)
        print(f"\n✓ Saved rules to {output_file}")

        # Also save as formatted markdown
        save_as_markdown(all_rules)

        return all_rules

    except Exception as e:
        print(f"Error: {str(e)}")
        return None

    finally:
        driver.quit()
        print("Browser closed")

def save_as_markdown(rules_dict):
    """Convert the scraped rules to a formatted markdown file"""

    markdown_content = f"""# CBOA Complete Rules Modifications
*Scraped on: {datetime.now().strftime('%Y-%m-%d %H:%M')}*
*Source: https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications*

---

"""

    for title, content in rules_dict.items():
        # Clean up the title
        title = title.strip()

        # Add to markdown
        markdown_content += f"## {title}\n\n"

        # Format content with proper line breaks
        if content:
            # Split into lines and format
            lines = content.split('\n')
            for line in lines:
                line = line.strip()
                if line:
                    # Check if it's a numbered or bulleted item
                    if line[0].isdigit() and (line[1] == '.' or line[1] == ')'):
                        markdown_content += f"{line}\n"
                    elif line.startswith('•') or line.startswith('-'):
                        markdown_content += f"{line}\n"
                    else:
                        markdown_content += f"{line}\n\n"

        markdown_content += "\n---\n\n"

    # Save markdown file
    output_file = "cboa_rules_scraped.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    print(f"✓ Saved formatted rules to {output_file}")

def quick_test():
    """Quick test to verify Selenium is working"""
    print("Running quick Selenium test...")
    driver = setup_driver()
    try:
        driver.get("https://www.google.com")
        print("✓ Selenium is working!")
        return True
    except Exception as e:
        print(f"✗ Selenium test failed: {str(e)}")
        return False
    finally:
        driver.quit()

if __name__ == "__main__":
    print("=" * 50)
    print("CBOA RULES MODIFICATIONS SCRAPER")
    print("=" * 50)

    # Test Selenium first
    if quick_test():
        print("\nStarting main scrape...")
        rules = scrape_cboa_rules()

        if rules:
            print(f"\n✓ Successfully scraped {len(rules)} sections")
            print("\nFirst few sections found:")
            for title in list(rules.keys())[:5]:
                print(f"  - {title}")
        else:
            print("\n✗ Scraping failed")
    else:
        print("\nPlease ensure Chrome and ChromeDriver are installed.")
        print("Install with: pip install selenium")
        print("Download ChromeDriver from: https://chromedriver.chromium.org/")
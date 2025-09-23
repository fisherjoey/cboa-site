"""
CBOA Rules Scraper - Proper Selenium Version for Google Sites
This version correctly handles Google Sites expandable sections
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException, NoSuchElementException, ElementClickInterceptedException
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
from datetime import datetime
import re

def setup_driver(headless=False):
    """Setup Chrome driver with proper options"""
    chrome_options = Options()

    if headless:
        chrome_options.add_argument("--headless")

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--start-maximized")
    chrome_options.add_experimental_option('excludeSwitches', ['enable-logging'])

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    return driver

def scrape_cboa_rules():
    """Main function to properly scrape Google Sites dropdowns"""

    print("Starting CBOA Rules Scraper (Proper Google Sites Version)...")
    driver = setup_driver(headless=False)  # Run with visible browser for debugging
    wait = WebDriverWait(driver, 10)

    all_rules = {}

    try:
        # Navigate to the page
        url = "https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications"
        print(f"Navigating to {url}")
        driver.get(url)

        # Wait for page to fully load
        time.sleep(5)

        print("Page loaded. Looking for expandable sections...")

        # Google Sites uses these patterns for expandable content
        # Method 1: Find all elements with role="button" and aria-expanded attribute
        expandable_buttons = driver.find_elements(By.CSS_SELECTOR, '[role="button"][aria-expanded]')
        print(f"Found {len(expandable_buttons)} expandable buttons")

        # Method 2: Find elements by the expand icon class
        if not expandable_buttons:
            expandable_buttons = driver.find_elements(By.CSS_SELECTOR, '.Fktve')  # Google Sites expand icon class
            print(f"Found {len(expandable_buttons)} elements with expand icon class")

        # Method 3: Find by elements containing "Updated" text
        if not expandable_buttons:
            all_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Updated') or contains(text(), '(Updated')]")
            # Filter to get only the header elements
            expandable_buttons = [elem for elem in all_elements if elem.tag_name in ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'div']]
            print(f"Found {len(expandable_buttons)} elements containing 'Updated'")

        # Process each expandable section
        for i, button in enumerate(expandable_buttons):
            try:
                # Get the header text
                header_text = button.text.strip()

                # Skip if it's empty or too long (probably not a header)
                if not header_text or len(header_text) > 200:
                    continue

                print(f"\n[{i+1}/{len(expandable_buttons)}] Processing: {header_text[:80]}...")

                # Scroll to the element
                driver.execute_script("arguments[0].scrollIntoView({behavior: 'smooth', block: 'center'});", button)
                time.sleep(1)

                # Check if already expanded
                is_expanded = button.get_attribute('aria-expanded') == 'true'

                if not is_expanded:
                    # Try different click methods
                    try:
                        # Method 1: Regular click
                        button.click()
                    except ElementClickInterceptedException:
                        try:
                            # Method 2: JavaScript click
                            driver.execute_script("arguments[0].click();", button)
                        except:
                            try:
                                # Method 3: Action chains
                                ActionChains(driver).move_to_element(button).click().perform()
                            except:
                                print(f"  Could not click element")
                                continue

                    # Wait for expansion
                    time.sleep(1.5)

                # Now find the expanded content
                # Google Sites typically puts content in the next sibling or within a container
                content = ""

                # Try to find the content container
                try:
                    # Method 1: Look for the next sibling with content
                    next_element = driver.execute_script("""
                        return arguments[0].nextElementSibling;
                    """, button)

                    if next_element:
                        content = next_element.text.strip()
                except:
                    pass

                # Method 2: Look for expanded content in parent container
                if not content or len(content) < 50:
                    try:
                        parent = button.find_element(By.XPATH, "..")
                        # Get all text from parent, excluding the header
                        full_text = parent.text
                        # Remove the header text from the beginning
                        if full_text.startswith(header_text):
                            content = full_text[len(header_text):].strip()
                        else:
                            content = full_text
                    except:
                        pass

                # Method 3: Look for content div with specific classes
                if not content or len(content) < 50:
                    try:
                        content_divs = button.find_elements(By.XPATH,
                            "./following-sibling::*[contains(@class, 'CDt4Ke') or contains(@class, 'zfr3Q')]")
                        if content_divs:
                            content = "\n".join([div.text for div in content_divs])
                    except:
                        pass

                # Store the content if we got something substantial
                if content and len(content) > 20:
                    # Clean the header text for use as key
                    clean_header = header_text.split('\n')[0]  # Take first line only
                    all_rules[clean_header] = content
                    print(f"  [OK] Extracted {len(content)} characters")
                else:
                    print(f"  [SKIP] No substantial content found")

            except Exception as e:
                print(f"  [ERROR] {str(e)}")
                continue

        # Additional attempt: Execute JavaScript to expand all and get content
        if len(all_rules) < 10:  # If we didn't get much, try JavaScript approach
            print("\nTrying JavaScript expansion method...")

            driver.execute_script("""
                // Expand all collapsible sections
                document.querySelectorAll('[aria-expanded="false"]').forEach(el => {
                    el.click();
                });

                // Also try clicking elements with expand icons
                document.querySelectorAll('.Fktve').forEach(el => {
                    el.click();
                });
            """)

            time.sleep(3)  # Wait for all expansions

            # Now try to get all expanded content
            expanded_sections = driver.execute_script("""
                let sections = {};

                // Find all expanded sections
                document.querySelectorAll('[aria-expanded="true"]').forEach(button => {
                    let header = button.innerText.trim();
                    let parent = button.parentElement;

                    // Try to find the content
                    let content = '';

                    // Look for next sibling
                    let nextSibling = button.nextElementSibling;
                    if (nextSibling) {
                        content = nextSibling.innerText;
                    }

                    // If no content, get parent's text
                    if (!content && parent) {
                        content = parent.innerText;
                    }

                    if (header && content && content.length > header.length) {
                        // Remove header from content if it's at the beginning
                        if (content.startsWith(header)) {
                            content = content.substring(header.length).trim();
                        }
                        sections[header] = content;
                    }
                });

                return sections;
            """)

            # Add JavaScript results to our rules
            if expanded_sections:
                for header, content in expanded_sections.items():
                    if header not in all_rules and len(content) > 20:
                        all_rules[header] = content
                        print(f"  [JS] Added: {header[:50]}...")

        # Save the results
        output_file = "cboa_rules_complete.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(all_rules, f, indent=2, ensure_ascii=False)

        print(f"\n[SUCCESS] Scraped {len(all_rules)} league/tournament rules")
        print(f"Saved to {output_file}")

        # Also save as markdown
        save_as_markdown(all_rules)

        # List what we got
        print("\nExtracted rules for:")
        for i, league in enumerate(all_rules.keys(), 1):
            print(f"  {i}. {league}")

        return all_rules

    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
        return None

    finally:
        print("\nClosing browser...")
        driver.quit()

def save_as_markdown(rules_dict):
    """Convert to well-formatted markdown"""

    markdown = f"""# CBOA Complete Rules - All Leagues and Tournaments
*Scraped on: {datetime.now().strftime('%Y-%m-%d %H:%M')}*
*Source: https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications*

---

## Table of Contents

"""

    # Add table of contents
    for i, league in enumerate(rules_dict.keys(), 1):
        markdown += f"{i}. [{league}](#{league.lower().replace(' ', '-').replace('(', '').replace(')', '')})\n"

    markdown += "\n---\n\n"

    # Add each league's rules
    for league, content in rules_dict.items():
        markdown += f"## {league}\n\n"

        # Format the content nicely
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if line:
                # Check for numbered items
                if re.match(r'^\d+[\.\)]\s', line):
                    markdown += f"{line}\n"
                # Check for lettered sub-items
                elif re.match(r'^[a-z][\.\)]\s', line):
                    markdown += f"   {line}\n"
                # Check for bullet points
                elif line.startswith('•') or line.startswith('-'):
                    markdown += f"{line}\n"
                # Regular paragraph
                else:
                    markdown += f"{line}\n\n"

        markdown += "\n---\n\n"

    # Save the markdown file
    output_file = "cboa_rules_selenium.md"
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(markdown)

    print(f"[OK] Saved formatted rules to {output_file}")

if __name__ == "__main__":
    print("=" * 70)
    print("CBOA RULES SCRAPER - PROPER SELENIUM VERSION")
    print("=" * 70)

    rules = scrape_cboa_rules()

    if rules:
        print(f"\n[SUCCESS] Extraction complete!")
        print(f"Total leagues/tournaments extracted: {len(rules)}")
    else:
        print("\n[FAILED] Extraction failed. Please check the error messages above.")
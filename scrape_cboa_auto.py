"""
CBOA Rules Scraper - Auto Version
Automatically manages ChromeDriver installation
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

def setup_driver():
    """Setup Chrome driver with automatic ChromeDriver management"""
    chrome_options = Options()

    # Optional: Run in headless mode (no browser window)
    # Uncomment the next line to hide the browser
    # chrome_options.add_argument("--headless")

    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")

    # Auto-download and setup ChromeDriver
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    return driver

def scrape_rules():
    """Main scraping function"""
    print("Starting CBOA Rules Scraper (Auto Version)...")
    print("This will automatically download ChromeDriver if needed...")

    driver = setup_driver()
    all_rules = {}

    try:
        # Navigate to the page
        url = "https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications"
        print(f"\nNavigating to CBOA rules page...")
        driver.get(url)

        # Wait for page to load
        print("Waiting for page to load...")
        time.sleep(5)

        # Method 1: Try to find expandable headers by looking for updated dates
        print("\nSearching for league/tournament sections...")

        # Find all potential dropdown headers (they usually contain "Updated" in the text)
        all_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Updated')]")

        print(f"Found {len(all_elements)} potential sections")

        for element in all_elements:
            try:
                # Get the full text of the element
                header_text = element.text

                # Skip if it's too long (probably not a header)
                if len(header_text) > 100:
                    continue

                print(f"\nProcessing: {header_text[:50]}...")

                # Try to click the element to expand it
                try:
                    # Scroll to element
                    driver.execute_script("arguments[0].scrollIntoView(true);", element)
                    time.sleep(0.5)

                    # Try to click
                    element.click()
                    time.sleep(1)

                    # Get the parent element's full text after clicking
                    parent = element.find_element(By.XPATH, "./..")
                    full_text = parent.text

                    # Store if we got meaningful content
                    if len(full_text) > len(header_text) + 50:
                        all_rules[header_text] = full_text
                        print(f"  [OK] Extracted {len(full_text)} characters")

                except Exception as e:
                    # Element might not be clickable, try getting parent text anyway
                    try:
                        parent = element.find_element(By.XPATH, "./..")
                        full_text = parent.text
                        if full_text and len(full_text) > 100:
                            all_rules[header_text[:50]] = full_text
                    except:
                        pass

            except Exception as e:
                continue

        # Method 2: Get all collapsible content by class names
        print("\n\nLooking for collapsible sections by class...")

        collapsible_classes = [
            "collapsible-item",
            "accordion-item",
            "expand-item",
            "expandable-content",
            "dropdown-content"
        ]

        for class_name in collapsible_classes:
            try:
                elements = driver.find_elements(By.CLASS_NAME, class_name)
                if elements:
                    print(f"Found {len(elements)} elements with class '{class_name}'")
                    for elem in elements:
                        try:
                            elem.click()
                            time.sleep(0.5)
                            text = elem.text
                            if text and len(text) > 100:
                                # Use first line as title
                                lines = text.split('\n')
                                title = lines[0] if lines else f"Section {len(all_rules)}"
                                all_rules[title] = text
                        except:
                            pass
            except:
                pass

        # Method 3: Try JavaScript to expand all
        print("\n\nTrying JavaScript to expand all sections...")
        try:
            driver.execute_script("""
                // Try to click all elements with aria-expanded attribute
                document.querySelectorAll('[aria-expanded="false"]').forEach(el => {
                    el.click();
                });

                // Try to click all elements that might be dropdowns
                document.querySelectorAll('[role="button"]').forEach(el => {
                    if (el.textContent.includes('Updated')) {
                        el.click();
                    }
                });
            """)
            time.sleep(3)

            # Now get the full page content
            full_page = driver.find_element(By.TAG_NAME, "body").text
            all_rules["Full Page Content After Expansion"] = full_page

        except Exception as e:
            print(f"JavaScript expansion failed: {e}")

        # Save results
        if all_rules:
            # Save as JSON
            with open("cboa_rules_auto.json", "w", encoding="utf-8") as f:
                json.dump(all_rules, f, indent=2, ensure_ascii=False)
            print(f"\n[OK] Saved {len(all_rules)} sections to cboa_rules_auto.json")

            # Save as Markdown
            save_as_markdown(all_rules)
        else:
            print("\n[ERROR] No rules content found")
            # Save page source for debugging
            with open("page_source.html", "w", encoding="utf-8") as f:
                f.write(driver.page_source)
            print("Saved page source to page_source.html for debugging")

    except Exception as e:
        print(f"\nError: {str(e)}")

    finally:
        print("\nClosing browser...")
        driver.quit()
        print("Done!")

def save_as_markdown(rules_dict):
    """Save rules as formatted markdown"""

    markdown = f"""# CBOA Rules - All Leagues and Tournaments
*Scraped on: {datetime.now().strftime('%Y-%m-%d %H:%M')}*

---

"""

    for title, content in rules_dict.items():
        markdown += f"## {title}\n\n"

        # Format content nicely
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if line:
                # Detect list items
                if line[0:2] in ['1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.'] or line.startswith('•'):
                    markdown += f"{line}\n"
                elif line.startswith('-'):
                    markdown += f"  {line}\n"
                else:
                    markdown += f"{line}\n\n"

        markdown += "\n---\n\n"

    with open("cboa_rules_auto.md", "w", encoding="utf-8") as f:
        f.write(markdown)
    print("[OK] Saved formatted rules to cboa_rules_auto.md")

if __name__ == "__main__":
    print("=" * 60)
    print("CBOA RULES SCRAPER - AUTO VERSION")
    print("=" * 60)
    print("\nThis script will:")
    print("1. Auto-install ChromeDriver if needed")
    print("2. Open Chrome browser")
    print("3. Navigate to CBOA rules page")
    print("4. Try to expand all dropdowns")
    print("5. Extract all content")
    print("6. Save to JSON and Markdown files")
    print("\nPress Ctrl+C to cancel at any time")
    print("-" * 60)

    try:
        scrape_rules()
    except KeyboardInterrupt:
        print("\n\nCancelled by user")
    except Exception as e:
        print(f"\n\nFatal error: {e}")

    # input("\nPress Enter to exit...")  # Commented out for batch execution
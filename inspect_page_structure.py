"""
Inspect Google Sites page structure to find correct selectors
"""

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

def inspect_page():
    """Inspect the page structure to understand how to extract content"""

    print("Starting page inspection...")

    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")

    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)

    try:
        url = "https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications"
        print(f"Navigating to {url}")
        driver.get(url)

        time.sleep(5)

        # Save page source
        with open("page_source_before.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("Saved initial page source to page_source_before.html")

        # Find all possible expandable elements
        print("\nSearching for expandable elements...")

        selectors_to_try = [
            '[role="button"]',
            '[aria-expanded]',
            '.Fktve',  # Google Sites expand icon
            '.IqJTee',  # Another Google Sites class
            '.oKdM2c',  # Expandable content class
            '.TMjjoe',  # Content wrapper
            '[jsname]',  # Elements with jsname attribute
            '.n8H08c',  # Collapsible item
            '.UVGPO',  # Header element
        ]

        elements_found = {}

        for selector in selectors_to_try:
            try:
                elements = driver.find_elements(By.CSS_SELECTOR, selector)
                if elements:
                    elements_found[selector] = len(elements)
                    print(f"  {selector}: {len(elements)} elements")

                    # Print first few elements' text
                    for i, elem in enumerate(elements[:3]):
                        text = elem.text[:100] if elem.text else "[no text]"
                        tag = elem.tag_name
                        classes = elem.get_attribute('class')
                        print(f"    [{i}] <{tag} class='{classes}'> {text}")
            except:
                pass

        # Look for elements containing league names
        print("\nSearching for league name patterns...")

        league_patterns = [
            "Alberta Hoops",
            "ASAA",
            "Calgary Public",
            "CBE",
            "CSMBA",
            "Calgary Catholic"
        ]

        for pattern in league_patterns:
            elements = driver.find_elements(By.XPATH, f"//*[contains(text(), '{pattern}')]")
            if elements:
                print(f"\nFound {len(elements)} elements containing '{pattern}':")
                for elem in elements[:2]:
                    parent = elem.find_element(By.XPATH, "..")
                    print(f"  Element: {elem.tag_name}, Parent: {parent.tag_name}")
                    print(f"  Classes: {elem.get_attribute('class')}")
                    print(f"  Text: {elem.text[:100]}")

        # Try to click an expandable element
        print("\nAttempting to expand sections...")

        # Execute JavaScript to find and click expandables
        result = driver.execute_script("""
            let found = [];

            // Method 1: Find all elements with text containing "Updated"
            let allElements = document.querySelectorAll('*');
            for (let elem of allElements) {
                if (elem.innerText && elem.innerText.includes('Updated') && elem.innerText.length < 100) {
                    found.push({
                        tag: elem.tagName,
                        class: elem.className,
                        text: elem.innerText.substring(0, 50),
                        hasClick: typeof elem.onclick === 'function',
                        parent: elem.parentElement ? elem.parentElement.className : 'none'
                    });

                    // Try to click it
                    try {
                        elem.click();
                    } catch(e) {}
                }
            }

            return found;
        """)

        print(f"\nFound {len(result)} potential dropdown headers:")
        for item in result[:10]:
            print(f"  {item}")

        time.sleep(3)

        # Save page source after clicking
        with open("page_source_after.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("\nSaved page source after expansion to page_source_after.html")

        # Try alternative method - look for Google Sites specific structure
        print("\nTrying Google Sites specific extraction...")

        content = driver.execute_script("""
            let rules = {};

            // Google Sites puts content in divs with specific structure
            // Look for all text nodes and group by proximity

            let sections = document.querySelectorAll('.n8H08c, .oKdM2c, .IqJTee');

            sections.forEach(section => {
                let text = section.innerText;
                if (text && text.includes('Updated')) {
                    // This might be a league section
                    let lines = text.split('\\n');
                    let header = lines[0];
                    let content = lines.slice(1).join('\\n');

                    if (header && content) {
                        rules[header] = content;
                    }
                }
            });

            return rules;
        """)

        if content:
            with open("extracted_content.json", "w", encoding="utf-8") as f:
                json.dump(content, f, indent=2)
            print(f"\nExtracted {len(content)} sections to extracted_content.json")

        return content

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

    finally:
        driver.quit()
        print("\nBrowser closed")

if __name__ == "__main__":
    inspect_page()
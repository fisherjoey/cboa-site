"""
CBOA Rules Scraper using Playwright
Playwright handles dynamic JavaScript content much better than Selenium
"""

import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime

async def scrape_with_playwright():
    """Use Playwright to properly scrape Google Sites dropdowns"""

    all_rules = {}

    async with async_playwright() as p:
        # Launch browser (use headless=False to see it working)
        browser = await p.chromium.launch(headless=False)
        page = await browser.new_page()

        print("Navigating to CBOA rules page...")
        await page.goto("https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications")

        # Wait for the page to fully load
        await page.wait_for_load_state("networkidle")
        await asyncio.sleep(2)

        print("Page loaded. Finding and clicking all dropdowns...")

        # Method 1: Click all expandable elements
        # Find all elements with aria-expanded="false"
        collapsed_elements = await page.query_selector_all('[aria-expanded="false"]')
        print(f"Found {len(collapsed_elements)} collapsed sections")

        # Click each one
        for i, element in enumerate(collapsed_elements):
            try:
                await element.click()
                print(f"  Clicked dropdown {i+1}/{len(collapsed_elements)}")
                await asyncio.sleep(0.5)  # Small delay between clicks
            except:
                pass

        # Wait for all content to load
        await asyncio.sleep(3)

        print("\nAll dropdowns expanded. Extracting content...")

        # Method 2: Now extract all the content
        # Execute JavaScript to get all expanded content
        extracted_rules = await page.evaluate("""
            () => {
                let rules = {};

                // Find all expanded sections
                let expanded = document.querySelectorAll('[aria-expanded="true"]');

                expanded.forEach(section => {
                    let header = section.textContent.trim();

                    // Find the content - try multiple methods
                    let content = null;

                    // Method 1: Next sibling
                    if (section.nextElementSibling) {
                        content = section.nextElementSibling.textContent;
                    }

                    // Method 2: Parent's next sibling
                    if (!content && section.parentElement.nextElementSibling) {
                        content = section.parentElement.nextElementSibling.textContent;
                    }

                    // Method 3: Look for content div after the header
                    if (!content) {
                        let parent = section.parentElement;
                        let allSiblings = Array.from(parent.parentElement.children);
                        let index = allSiblings.indexOf(parent);
                        if (index >= 0 && index < allSiblings.length - 1) {
                            content = allSiblings[index + 1].textContent;
                        }
                    }

                    if (content && content.length > 50) {
                        rules[header] = content.trim();
                    }
                });

                return rules;
            }
        """)

        # If the first method didn't get enough, try parsing the full text
        if len(extracted_rules) < 20:
            print("Using alternative extraction method...")

            # Get all text from the page
            full_text = await page.inner_text('body')

            # Parse the text to extract rules
            lines = full_text.split('\n')
            current_league = None
            current_content = []

            for line in lines:
                # Check if this is a league header (contains "Updated")
                if "Updated" in line and len(line) < 100:
                    # Save previous league if exists
                    if current_league and current_content:
                        content_text = '\n'.join(current_content)
                        if len(content_text) > 50:  # Only save substantial content
                            extracted_rules[current_league] = content_text

                    # Start new league
                    current_league = line.strip()
                    current_content = []

                elif current_league and line.strip():
                    # Skip navigation and footer content
                    skip_words = ['Home', 'General Meetings', 'CBOA Library', 'Copyright',
                                  'Performance and Assessment', 'Referee Development',
                                  'Member Services', 'Self Assign', 'Discord Setup']

                    if not any(skip in line for skip in skip_words):
                        current_content.append(line)

            # Don't forget the last league
            if current_league and current_content:
                content_text = '\n'.join(current_content)
                if len(content_text) > 50:
                    extracted_rules[current_league] = content_text

        all_rules = extracted_rules

        # Close browser
        await browser.close()

    return all_rules

async def main():
    print("=" * 60)
    print("CBOA RULES SCRAPER - PLAYWRIGHT VERSION")
    print("=" * 60)

    print("\nStarting extraction...")
    rules = await scrape_with_playwright()

    if rules:
        print(f"\n[SUCCESS] Successfully extracted {len(rules)} leagues/tournaments!")

        # Save as JSON
        with open("cboa_rules_playwright.json", "w", encoding="utf-8") as f:
            json.dump(rules, f, indent=2, ensure_ascii=False)
        print("Saved to cboa_rules_playwright.json")

        # Save as Markdown
        markdown = f"""# CBOA Complete Rules - All Leagues and Tournaments
*Extracted using Playwright on: {datetime.now().strftime('%Y-%m-%d %H:%M')}*
*Source: https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications*

Total Leagues/Tournaments: {len(rules)}

---

"""
        for league, content in rules.items():
            markdown += f"## {league}\n\n"
            markdown += content.replace('\n', '\n\n')
            markdown += "\n\n---\n\n"

        with open("cboa_rules_playwright.md", "w", encoding="utf-8") as f:
            f.write(markdown)
        print("Saved formatted version to cboa_rules_playwright.md")

        # List what we got
        print("\nExtracted rules for:")
        for i, league in enumerate(list(rules.keys())[:10], 1):
            print(f"  {i}. {league}")
        if len(rules) > 10:
            print(f"  ... and {len(rules) - 10} more")
    else:
        print("\n[FAILED] No rules extracted")

if __name__ == "__main__":
    # Install: pip install playwright
    # Then run: playwright install chromium
    asyncio.run(main())
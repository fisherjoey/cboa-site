"""
CBOA Rules Scraper using Playwright V2
This version clicks each dropdown individually and waits for content to appear
"""

import asyncio
from playwright.async_api import async_playwright
import json
from datetime import datetime
import re

async def scrape_with_playwright():
    """Use Playwright to scrape CBOA rules by clicking each dropdown"""

    all_rules = {}

    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(
            headless=False,  # Set to True to hide browser
            args=['--disable-blink-features=AutomationControlled']
        )

        context = await browser.new_context(
            viewport={'width': 1920, 'height': 1080},
            user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        )

        page = await context.new_page()

        print("Navigating to CBOA rules page...")
        await page.goto(
            "https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications",
            wait_until="networkidle"
        )

        await asyncio.sleep(3)
        print("Page loaded. Looking for dropdowns...")

        # Method 1: Find all league headers by text pattern
        league_headers = []

        # Find elements containing "Updated" which are our league headers
        all_elements = await page.query_selector_all('*')

        for element in all_elements:
            try:
                text = await element.inner_text()
                # Check if this looks like a league header
                if 'Updated' in text and len(text) < 150:
                    # Check if it's visible
                    is_visible = await element.is_visible()
                    if is_visible:
                        league_headers.append({
                            'element': element,
                            'text': text.strip()
                        })
            except:
                continue

        print(f"Found {len(league_headers)} potential league headers")

        # Process each header
        for i, header_info in enumerate(league_headers):
            try:
                header_text = header_info['text']
                element = header_info['element']

                # Clean up header text (remove extra whitespace)
                header_text = ' '.join(header_text.split())

                print(f"\n[{i+1}/{len(league_headers)}] Processing: {header_text[:60]}...")

                # Get initial page text
                initial_text = await page.inner_text('body')

                # Click the header to expand
                try:
                    await element.click()
                    print("  Clicked header...")
                except:
                    # Try JavaScript click if regular click fails
                    await page.evaluate('(element) => element.click()', element)
                    print("  Clicked via JavaScript...")

                # Wait for content to appear
                await asyncio.sleep(1.5)

                # Get expanded page text
                expanded_text = await page.inner_text('body')

                # Find the new content (difference between expanded and initial)
                if len(expanded_text) > len(initial_text) + 100:
                    # Extract the new content
                    # This is a simplified approach - find text after the header
                    lines = expanded_text.split('\n')

                    # Find where our header appears
                    header_index = -1
                    for idx, line in enumerate(lines):
                        if header_text in line or line in header_text:
                            header_index = idx
                            break

                    if header_index >= 0:
                        # Collect content after the header until the next header or end
                        content_lines = []
                        for idx in range(header_index + 1, len(lines)):
                            line = lines[idx].strip()

                            # Stop at next league header
                            if 'Updated' in line and len(line) < 150:
                                break

                            # Skip navigation elements
                            skip_terms = ['Home', 'General Meetings', 'CBOA Library',
                                          'Performance and Assessment', 'Referee Development',
                                          'Member Services', 'Self Assign', 'Discord Setup',
                                          'Copyright Calgary Basketball']

                            if not any(term in line for term in skip_terms) and line:
                                content_lines.append(line)

                        if content_lines:
                            content = '\n'.join(content_lines)
                            if len(content) > 50:  # Only save substantial content
                                all_rules[header_text] = content
                                print(f"  [OK] Extracted {len(content)} characters")
                            else:
                                print(f"  [SKIP] Content too short")
                        else:
                            print(f"  [SKIP] No content found")

            except Exception as e:
                print(f"  [ERROR] {str(e)}")
                continue

        # Alternative method: Click all at once and parse
        if len(all_rules) < 10:
            print("\n" + "="*60)
            print("Trying bulk expansion method...")

            # Click all collapsed elements
            await page.evaluate("""
                () => {
                    document.querySelectorAll('[aria-expanded="false"]').forEach(el => el.click());
                }
            """)

            await asyncio.sleep(3)

            # Get all text
            full_text = await page.inner_text('body')

            # Parse by headers
            lines = full_text.split('\n')
            current_league = None
            current_content = []

            for line in lines:
                line = line.strip()

                # Check if this is a league header
                if re.search(r'\(Updated .+\)$', line) or 'Updated' in line:
                    if len(line) < 150:  # Reasonable header length
                        # Save previous league
                        if current_league and current_content:
                            content = '\n'.join(current_content)
                            if len(content) > 50 and current_league not in all_rules:
                                all_rules[current_league] = content

                        # Start new league
                        current_league = line
                        current_content = []
                elif current_league:
                    # Add to current content if not navigation
                    skip_terms = ['Home', 'General Meetings', 'CBOA Library',
                                  'Copyright', 'Performance', 'Referee Development']

                    if not any(term in line for term in skip_terms) and line:
                        current_content.append(line)

            # Save last league
            if current_league and current_content:
                content = '\n'.join(current_content)
                if len(content) > 50:
                    all_rules[current_league] = content

        # Close browser
        await browser.close()

    return all_rules

async def main():
    print("=" * 70)
    print("CBOA RULES SCRAPER - PLAYWRIGHT V2")
    print("=" * 70)

    rules = await scrape_with_playwright()

    if rules:
        print(f"\n[SUCCESS] Extracted {len(rules)} leagues/tournaments!")

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

            # Format content
            lines = content.split('\n')
            for line in lines:
                if line.strip():
                    # Detect numbered items
                    if re.match(r'^\d+[.)]\s', line):
                        markdown += f"{line}\n"
                    # Detect lettered items
                    elif re.match(r'^[a-z][.)]\s', line):
                        markdown += f"  {line}\n"
                    else:
                        markdown += f"{line}\n\n"

            markdown += "\n---\n\n"

        with open("cboa_rules_playwright.md", "w", encoding="utf-8") as f:
            f.write(markdown)
        print("Saved to cboa_rules_playwright.md")

        # Show what we got
        print("\nExtracted rules for:")
        for i, league in enumerate(list(rules.keys())[:15], 1):
            print(f"  {i}. {league[:60]}")
        if len(rules) > 15:
            print(f"  ... and {len(rules) - 15} more")

    else:
        print("\n[FAILED] No rules extracted")

if __name__ == "__main__":
    asyncio.run(main())
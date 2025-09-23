"""
Final CBOA scraper - Click all dropdowns then extract
"""

from playwright.sync_api import sync_playwright
import json
from datetime import datetime

def scrape_cboa():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=False)
        page = browser.new_page()

        print("Loading page...")
        page.goto("https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications")
        page.wait_for_load_state("networkidle")

        print("Expanding all dropdowns...")
        # Click all collapsed dropdowns
        page.evaluate("""
            () => {
                document.querySelectorAll('[aria-expanded="false"]').forEach(el => el.click());
                return document.querySelectorAll('[aria-expanded="true"]').length;
            }
        """)

        # Wait for content to load
        page.wait_for_timeout(3000)

        print("Extracting all expanded content...")
        # Get all the text
        full_text = page.inner_text('body')

        browser.close()

        # Parse the text
        rules = {}
        lines = full_text.split('\n')
        current_league = None
        current_content = []

        for line in lines:
            # Check for league headers (contain "Updated")
            if 'Updated' in line and len(line) < 150:
                # Save previous league
                if current_league and current_content:
                    content = '\n'.join(current_content)
                    if len(content) > 50:
                        rules[current_league] = content

                # Start new league
                current_league = line.strip()
                current_content = []

            elif current_league:
                # Skip navigation items
                skip = ['Home', 'General Meetings', 'CBOA Library', 'Copyright',
                        'Performance and Assessment', 'Referee Development',
                        'Member Services', 'Self Assign', 'Discord Setup']

                if not any(s in line for s in skip) and line.strip():
                    current_content.append(line.strip())

        # Save last league
        if current_league and current_content:
            content = '\n'.join(current_content)
            if len(content) > 50:
                rules[current_league] = content

        return rules

if __name__ == "__main__":
    print("CBOA RULES SCRAPER - FINAL VERSION")
    print("="*50)

    rules = scrape_cboa()

    if rules:
        print(f"\nExtracted {len(rules)} leagues!")

        # Save JSON
        with open("cboa_rules_final.json", "w", encoding="utf-8") as f:
            json.dump(rules, f, indent=2, ensure_ascii=False)

        # Save Markdown
        with open("cboa_rules_final.md", "w", encoding="utf-8") as f:
            f.write(f"# CBOA Rules - {len(rules)} Leagues\n\n")
            for league, content in rules.items():
                f.write(f"## {league}\n\n{content}\n\n---\n\n")

        print("Saved to cboa_rules_final.json and .md")

        # Show leagues found
        for i, league in enumerate(list(rules.keys())[:10], 1):
            print(f"{i}. {league}")
        if len(rules) > 10:
            print(f"... and {len(rules)-10} more")
    else:
        print("No rules found")
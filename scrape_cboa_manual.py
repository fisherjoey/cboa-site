"""
CBOA Rules Manual Scraper
This version provides instructions for manual extraction
"""

import json
from datetime import datetime

# This is the complete list of all leagues/tournaments from the CBOA page
LEAGUES = [
    "Alberta Hoops Summit (U18 Boys)",
    "ASAA",
    "Alisa Suykens Memorial Tournament (Okotoks)",
    "Alley Oop Basketball Tournament",
    "Battle at Big Rock",
    "CJBL",
    "CHSSL",
    "CSMBA Rule Modifications",
    "CSWBA (Senior Women's Masters)",
    "CSWBA (Senior Women's Div 2)",
    "Calgary Corporate Challenge (CCC)",
    "Calgary Catholic Junior High (Seniors)",
    "Calgary Catholic Junior High",
    "Calgary High School Athletic Association (CHSAA)",
    "Calgary Independent Schools Athletic Association (CISAA)",
    "Calgary Indohoops Tournament",
    "Calgary Korean Basketball Association",
    "Calgary Public (CBE) Junior High",
    "Calgary Surge 3x3",
    "Crowther Memorial Junior B",
    "Edge Invitational",
    "Full Court Events (Fall Club League: U13, U15, U17)",
    "Genesis Spring League",
    "Genesis Classic (Girls and Boys)",
    "ISAA Junior High",
    "ISAA High School",
    "JLL Charity 3x3",
    "Mount Royal Spring League",
    "Nelson Mandela Invitational",
    "Rocky View Schools Grade 6",
    "Rocky View Schools Junior B",
    "Rocky View Schools Junior High",
    "Rundle Junior High Tournament",
    "Sherwood School Junior High Tournament",
    "Shooting Star Tournaments",
    "St. John Paul II Collegiate Junior High",
    "St. Martin de Porres Jr Boys",
    "Western Crown Presented by Genesis Basketball",
    "W.I.N. Tournament",
    "William D. Pratt Maverick Madness Tournament",
    "Visions Tournaments"
]

def create_manual_template():
    """Create a template file for manual data entry"""

    template = {}

    print("\n" + "="*60)
    print("MANUAL EXTRACTION INSTRUCTIONS")
    print("="*60)
    print("\n1. Open the CBOA rules page in your browser:")
    print("   https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications")
    print("\n2. For each league below, click to expand and copy ALL the content")
    print("\n3. Paste the content when prompted")
    print("\n4. The script will save everything to a formatted file")
    print("-"*60)

    for i, league in enumerate(LEAGUES, 1):
        print(f"\n[{i}/{len(LEAGUES)}] {league}")
        print("Please expand this section on the website and paste the COMPLETE rules below.")
        print("(Type 'SKIP' if this league is not on the page)")
        print("(Type 'END' and press Enter twice to finish this entry)")
        print("-"*40)

        # Collect multi-line input
        lines = []
        while True:
            try:
                line = input()
                if line.upper() == 'SKIP':
                    print(f"  → Skipped {league}")
                    break
                if line == 'END':
                    content = '\n'.join(lines)
                    if content:
                        template[league] = content
                        print(f"  → Saved {len(content)} characters")
                    break
                lines.append(line)
            except KeyboardInterrupt:
                print("\n\nStopping manual entry...")
                break

        # Save progress after each entry
        with open("cboa_rules_manual_progress.json", "w", encoding="utf-8") as f:
            json.dump(template, f, indent=2, ensure_ascii=False)

    return template

def save_to_markdown(rules_dict):
    """Convert to formatted markdown"""

    markdown = f"""# CBOA Complete Rules - All Leagues and Tournaments
*Manually extracted on: {datetime.now().strftime('%Y-%m-%d %H:%M')}*
*Source: https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications*

---

"""

    for league, content in rules_dict.items():
        markdown += f"## {league}\n\n"

        # Format content
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if line:
                # Detect numbered lists
                if line[0].isdigit() and len(line) > 1 and line[1] in '.):':
                    markdown += f"{line}\n"
                # Detect bullet points
                elif line.startswith('•') or line.startswith('-'):
                    markdown += f"{line}\n"
                # Regular text
                else:
                    markdown += f"{line}\n\n"

        markdown += "\n---\n\n"

    # Save file
    with open("cboa_rules_manual_complete.md", "w", encoding="utf-8") as f:
        f.write(markdown)

    print(f"\n✓ Saved complete rules to cboa_rules_manual_complete.md")

def alternative_browser_method():
    """Instructions for using browser console"""

    print("\n" + "="*60)
    print("ALTERNATIVE: BROWSER CONSOLE METHOD")
    print("="*60)
    print("\n1. Open the CBOA rules page")
    print("\n2. Open browser Developer Tools (F12)")
    print("\n3. Go to Console tab")
    print("\n4. Paste this JavaScript code:")
    print("-"*40)

    js_code = """
// Expand all dropdowns
document.querySelectorAll('[aria-expanded="false"]').forEach(el => {
    el.click();
});

// Wait 2 seconds then collect all text
setTimeout(() => {
    let allRules = {};

    // Find all expanded sections
    document.querySelectorAll('[aria-expanded="true"]').forEach(section => {
        let title = section.textContent.trim();
        let parent = section.parentElement;
        if (parent) {
            let content = parent.textContent;
            allRules[title] = content;
        }
    });

    // Copy to clipboard
    copy(JSON.stringify(allRules, null, 2));
    console.log('[OK] Rules copied to clipboard! Paste into a file called cboa_rules.json');

}, 2000);
"""

    print(js_code)
    print("-"*40)
    print("\n5. The rules will be copied to your clipboard")
    print("6. Paste into a file and save as 'cboa_rules.json'")
    print("7. Run this script with --process flag to format it")

if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == '--process':
        # Process existing JSON file
        try:
            with open("cboa_rules.json", "r", encoding="utf-8") as f:
                rules = json.load(f)
            save_to_markdown(rules)
            print("✓ Processed cboa_rules.json successfully!")
        except FileNotFoundError:
            print("✗ cboa_rules.json not found. Please create it first using the browser console method.")
    else:
        print("\n" + "="*60)
        print("CBOA RULES MANUAL EXTRACTION TOOL")
        print("="*60)
        print("\nChoose an option:")
        print("1. Manual copy-paste method")
        print("2. Browser console method (recommended)")
        print("3. Process existing JSON file")

        choice = input("\nEnter choice (1/2/3): ").strip()

        if choice == '1':
            rules = create_manual_template()
            if rules:
                save_to_markdown(rules)
                with open("cboa_rules_manual.json", "w", encoding="utf-8") as f:
                    json.dump(rules, f, indent=2, ensure_ascii=False)
                print("✓ Saved to cboa_rules_manual.json")
        elif choice == '2':
            alternative_browser_method()
        elif choice == '3':
            try:
                with open("cboa_rules.json", "r", encoding="utf-8") as f:
                    rules = json.load(f)
                save_to_markdown(rules)
            except FileNotFoundError:
                print("✗ cboa_rules.json not found")
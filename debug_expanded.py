"""
Debug script - Save expanded page HTML
"""

from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    print("Loading page...")
    page.goto("https://sites.google.com/view/cboa-resource-centre/cboa-scheduler-updates/rules-modifications", wait_until="domcontentloaded")
    page.wait_for_timeout(3000)  # Extra wait for JavaScript to load
    page.wait_for_load_state("networkidle")

    print("Expanding all dropdowns...")
    expanded_count = page.evaluate("""
        () => {
            document.querySelectorAll('[aria-expanded="false"]').forEach(el => el.click());
            return document.querySelectorAll('[aria-expanded="true"]').length;
        }
    """)
    print(f"Expanded {expanded_count} dropdowns")

    page.wait_for_timeout(3000)

    # Save the HTML
    html = page.content()
    with open("expanded_page.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Saved expanded page to expanded_page.html")

    # Also get the visible text
    text = page.inner_text('body')
    with open("expanded_text.txt", "w", encoding="utf-8") as f:
        f.write(text)
    print("Saved visible text to expanded_text.txt")

    browser.close()
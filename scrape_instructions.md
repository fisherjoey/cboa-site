# CBOA Rules Scraper Instructions

## Prerequisites

### 1. Install Python (if not already installed)
- Download from https://www.python.org/downloads/
- Make sure to check "Add Python to PATH" during installation

### 2. Install Required Python Packages
Open Command Prompt or Terminal and run:
```bash
pip install selenium webdriver-manager
```

Or use the requirements file:
```bash
pip install -r requirements_scraper.txt
```

### 3. Chrome Browser
- Make sure Google Chrome is installed
- The script will automatically download the correct ChromeDriver using webdriver-manager

## Running the Script

### Basic Usage
1. Open Command Prompt/Terminal
2. Navigate to the script directory:
   ```bash
   cd "C:\Users\School\Desktop\CBOA Static Site"
   ```
3. Run the script:
   ```bash
   python scrape_cboa_rules.py
   ```

### What the Script Does
1. Opens Chrome browser (you'll see it navigate automatically)
2. Goes to the CBOA rules page
3. Finds all expandable dropdown sections
4. Clicks each one to expand it
5. Extracts all the content
6. Saves the data in two formats:
   - `cboa_rules_complete.json` - Raw data in JSON format
   - `cboa_rules_scraped.md` - Formatted markdown document

### Troubleshooting

#### If you get a ChromeDriver error:
The script uses webdriver-manager to auto-download ChromeDriver, but if that fails:
1. Download ChromeDriver manually from https://chromedriver.chromium.org/
2. Download the version that matches your Chrome browser
3. Place chromedriver.exe in the same folder as the script
4. Update the script line:
   ```python
   driver = webdriver.Chrome(options=options)
   ```
   to:
   ```python
   driver = webdriver.Chrome(executable_path='./chromedriver.exe', options=options)
   ```

#### To run in visible mode (see the browser):
Comment out line 18 in the script:
```python
# options.add_argument('--headless')
```

#### If dropdowns aren't being detected:
The script tries multiple selectors to find dropdowns. You can add more selectors to the `selectors` list on line 46.

## Alternative: Simpler Script with webdriver-manager

Here's an even simpler version that auto-manages ChromeDriver:
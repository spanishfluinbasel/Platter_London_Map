import subprocess
import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

# Define the scope for Google Sheets API
SCOPES = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

# Path to your credentials file
CREDS_FILE = 'transkribusworkflow-5a2dd4fe025e.json'

# ID of the Google Sheet (from the URL of the sheet)
SHEET_ID = '1yGft0oKSDc3HfxGJVbt0HVjHb0Z2EvA06jAo0NuU8xw'

# Directory to save JSON files
OUTPUT_DIR = 'static/data'
SCREENSHOTS_DIR = 'static/images/screenshots/'


# Authenticate and connect to Google Sheets
def authenticate_google_sheets():
    credentials = ServiceAccountCredentials.from_json_keyfile_name(CREDS_FILE, SCOPES)
    client = gspread.authorize(credentials)
    return client


# Download data from each sheet and save as JSON
def download_and_save_json():
    target_types = {'p': 'people',
                    'n': 'news',
                    's': 'studies',
                    'd': 'digital',
                    'i': 'institute',
                    'r': 'research'}

    if not os.path.exists(SCREENSHOTS_DIR):
        os.makedirs(SCREENSHOTS_DIR)

    client = authenticate_google_sheets()
    sheet = client.open_by_key(SHEET_ID)

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    # Get the connection data
    connection_data = sheet.worksheet('_connections').get_all_records()

    # First pass: Collect coordinates for all entries
    coordinates_by_id = {}
    labels_by_id = {}
    all_data = {}

    for worksheet in sheet.worksheets():
        sheet_name = worksheet.title
        if sheet_name.startswith('_'):
            continue

        data = worksheet.get_all_records()
        all_data[sheet_name] = data

        for entry in data:
            entry_id = entry.get('id', '')
            x = entry.get('x', 0)
            y = entry.get('y', 0)
            coordinates_by_id[entry_id] = (x, y)
            labels_by_id[entry_id] = entry.get('name', '')

    # Set to track processed connections
    processed_connections = set()

    # Second pass: Process connections and create JSON output
    for sheet_name, data in all_data.items():
        for entry in data:
            entry_id = entry.get('id', '')
            url = entry.get('pageUrl', '')

            # Find the connection data for this entry
            connections = [c for c in connection_data if c['node1'] == entry_id or c['node2'] == entry_id]

            clean_connections = []
            for c in connections:
                if c['node1'] == entry_id:
                    source_id = entry_id
                    target_id = c['node2']
                    connection_label = c['label_to']
                else:
                    source_id = entry_id
                    target_id = c['node1']
                    connection_label = c['label_from']

                connection_type = c['type']
                target_coords = coordinates_by_id.get(target_id, (None, None))
                target_label = labels_by_id.get(target_id, '')

                # Use a tuple to represent the connection, sorted to avoid duplicates
                connection_tuple = tuple(sorted((source_id, target_id)))

                # Check if this connection has already been processed
                if connection_tuple in processed_connections:
                    is_secondary = True
                else:
                    is_secondary = False
                    processed_connections.add(connection_tuple)

                clean_connections.append({
                    'target': target_id,
                    'target_type': target_types.get(target_id[0], 'unknown'),
                    'target_label': target_label,
                    'type': connection_type,
                    'label': connection_label,
                    'target_coordinates': target_coords,
                    'is_secondary': is_secondary
                })

            # Add the connection data to the entry
            entry['connections'] = clean_connections

            # Set the screenshot output path
            output_path = os.path.join(SCREENSHOTS_DIR, f"ss_{entry_id}.png")

            if url:
                if not os.path.exists(output_path):
                    create_screenshot(url, output_path)
                print(f"Screenshot for {entry_id} saved to {output_path}")

        # Save data to JSON file
        json_file_path = os.path.join(OUTPUT_DIR, f"{sheet_name}.json")
        with open(json_file_path, 'w') as json_file:
            json.dump(data, json_file, indent=4)
        print(f"Data from sheet '{sheet_name}' saved to {json_file_path}")


# Function to create a screenshot using Puppeteer
def create_screenshot(url, output_path):
    # Puppeteer script to capture a screenshot
    puppeteer_script = f"""
    const puppeteer = require('puppeteer');

    (async () => {{
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto('{url}', {{ waitUntil: 'networkidle2' }});
        await page.screenshot({{ path: '{output_path}', fullPage: true }});
        await browser.close();
    }})();
    """

    with open('screenshot_script.js', 'w') as file:
        file.write(puppeteer_script)

    subprocess.run(["node", "screenshot_script.js"])
    os.remove('screenshot_script.js')


# Execute the function
if __name__ == "__main__":
    download_and_save_json()

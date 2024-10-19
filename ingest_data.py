import gspread
from oauth2client.service_account import ServiceAccountCredentials
import json
import os

# Define the scope for Google Sheets API
SCOPES = ['https://spreadsheets.google.com/feeds', 'https://www.googleapis.com/auth/drive']

# Path to your credentials file
CREDS_FILE = 'transkribusworkflow-5a2dd4fe025e.json'

# ID of the Google Sheet (from the URL of the sheet)
SHEET_ID = '1utlhteqoEZIEYZB2IZgABYUmo_8I0rZQhw9QKfpAnsg'

# Directory to save JSON files
OUTPUT_DIR = 'static/data'


# Authenticate and connect to Google Sheets
def authenticate_google_sheets():
    credentials = ServiceAccountCredentials.from_json_keyfile_name(CREDS_FILE, SCOPES)
    client = gspread.authorize(credentials)
    return client


# Download data from each sheet and save as JSON
def download_and_save_json():
    target_types = {'l': 'locations',
                    't': 'theatre',
                    'a': 'animals',
                    'p': 'persons'}

    client = authenticate_google_sheets()
    sheet = client.open_by_key(SHEET_ID)

    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

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

        # Save data to JSON file
        json_file_path = os.path.join(OUTPUT_DIR, f"{sheet_name}.json")
        with open(json_file_path, 'w') as json_file:
            json.dump(data, json_file, indent=4)
        print(f"Data from sheet '{sheet_name}' saved to {json_file_path}")


# Execute the function
if __name__ == "__main__":
    download_and_save_json()

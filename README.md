Map Explorer
============
Map Explorer is a web-based interactive map that visualizes various markers and their connections. It uses Leaflet.js for the map, custom tile layers, and dynamically generated content for each marker. The project integrates Google Sheets for data ingestion, Puppeteer for screenshot generation, and JavaScript for dynamic interactivity.


# Features

- Interactive map with custom tiles and markers
- Dynamic sidebar with detailed information on selected markers
- Connections between markers visualized as colored lines
- Hover and click interactivity for both map markers and sidebar items
- Animated page preview with scrolling effect in the sidebar
- Supports both desktop and mobile views with responsive layouts
- Google Sheets integration for data ingestion
- Puppeteer-based screenshot generation for map entries
- Scrollable bottom banner with clickable icons to toggle marker layers

# Technologies Used

- Frontend:
  - HTML, CSS, JavaScript (ES6)
  - Leaflet.js
  - jQuery for DOM manipulation
  - Puppeteer for generating screenshots
  - Google Sheets API for dynamic data ingestion

- Backend:
  - Python script to load the data
  - Node.js (for Puppeteer and screenshots)
  - Google Sheets for managing the data
  - JSON for storing marker data and connections


# Project Structure
```
root/
├── static/
│   ├── css/
│   │   └── map.css            # Main CSS styles
│   ├── images/
│   │   ├── screenshots/       # Screenshots for markers
│   │   └── icons/             # Marker and connection icons
│   ├── js/
│   │   └── markedMap.js       # Core JavaScript for the map and interactions
│   ├── data/
│   │   └── *.json             # JSON files generated from Google Sheets
│   └── tiles/                 # Tiled map image 
├── templates/
│   └── index.html             # Main HTML template
├── transkribusworkflow-5a2dd4fe025e.json  # Google Sheets API credentials
├── app.js                     # Node.js script for screenshot generation
└── README.md                  # Project README
```

# Setup Instructions

## Prerequisites
- Node.js and npm installed
- Google Sheets API credentials (stored in ``creds.json``)

## 1. Clone the Repository
```
git clone https://github.com/your-username/map-explorer.git
cd map-explorer
```

## 2. Install Dependencies
```
npm install
```

## 3. Google Sheets Integration
- Create a Google Sheets API project and download your credentials file. Save it as ``creds.json`` in the project root.
- Update the ``SHEET_ID`` in ``ingest_data.py`` with your Google Sheets document ID.

## 4. Running the App
```
npm start
```

## 5. Generate Screenshots for Markers
```
python app.py
```

## Regenerate Tiles
``gdal2tiles -p raster -z 0-5 -w none map.jpg tiles``

# Usage
1. Serve the tiles (for example:  http://localhost:8000)
2. Ingest the data with the ``data_ingest.py`` script
3. Open the index.html file
4. Click on any marker to view detailed information in the sidebar.
5. Toggle marker layers using the icons in the scrollable bottom banner.
6. Click on map connections to view their associated markers.

# Data Structure
- Each entry in Google Sheets has an id, x, y, label, and a name.
- Connection data includes type, source and target.


Map Explorer
============
Map Explorer is a web-based interactive map that visualizes various markers. 
It uses Leaflet.js for the map, custom tile layers, and dynamically generated content for each marker.
The project integrates Google Sheets for data ingestion and JavaScript for dynamic interactivity.


# Features

- Interactive map with custom tiles and markers
- Dynamic sidebar with detailed information on selected markers
- Supports both desktop and mobile views with responsive layouts
- Google Sheets integration for data ingestion


# Project Structure
```
root/
├── static/
│   ├── css/
│   │   └── map.css            # Main CSS styles
│   ├── images/
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

# Data Structure
- Each entry in Google Sheets has an id, x, y, label, and a name.
- Connection data includes type, source and target.


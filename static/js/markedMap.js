// markedMap.js
// Create a map with markers and connections between them

// Global object to keep track of markers by ID
const markersById = {};

//
const TYPES = {
    ANIMALS: {
        icon: 'static/icons/animals.svg',
        color: '#7994c8',
        description: 'Show or hide animal markers.'
    },
    LOCATIONS: {
        icon: 'static/icons/locations.svg',
        color: '#81ae71',
        description: 'Show or hide location markers.'
    },
    PERSONS: {
        icon: 'static/icons/persons.svg',
        color: '#bab17b',
        description: 'Show or hide person markers.'
    },
    THEATRE: {
        icon: 'static/icons/theatre.svg',
        color: '#d68787',
        description: 'Show or hide theatre markers.'
    }
};


/**
 * Function to create an SVG icon for a marker.
 * @param {string} iconUrl - The URL of the SVG file.
 * @param {string} type - The type of the marker (e.g., people, research).
 * @returns {Promise<L.DivIcon>} A promise that resolves to a Leaflet div icon with the SVG content inside a colored bubble.
 */
function createSvgIcon(iconUrl, type) {
    return fetch(iconUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(svgText => {
            // Use the color from TYPES for the background
            const color = TYPES[type.toUpperCase()].color;
            // Create a div icon using the fetched SVG and styling
            const iconHtml = `
                <div class="icon-wrapper" style="background-color: ${color};">
                    ${svgText}
                </div>
            `;
            return L.divIcon({
                className: 'custom-icon',
                html: iconHtml,
                iconSize: [30, 30],
                iconAnchor: [15, 15] // Center the icon
            });
        })
        .catch(error => {
            console.error('Error loading SVG:', error);
            // Return a default icon in case of error
            return L.divIcon({
                className: 'custom-icon',
                html: '<div style="width:30px;height:30px;background:#808080;border-radius:50%;"></div>',
                iconSize: [30, 30],
                iconAnchor: [15, 15]
            });
        });
}


function toggleLayer(map, layer, element) {
    if (map.hasLayer(layer)) {
        map.removeLayer(layer);
        element.classList.remove('active');
    } else {
        map.addLayer(layer);
        element.classList.add('active');
    }
}

// Function to open the specified tab
function openTab(evt, tabName) {
  let i, tabcontent, tablinks;

  // Hide all tab content
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  // Remove the 'active' class from all tab buttons
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  // Show the current tab and add 'active' class to the clicked button
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

/**
 * Function to update the sidebar content based on the marker data.
 * @param {object} data - An object containing data for the marker.
 */
function updateSidebarContent(data, type) {
    const infoContent = document.getElementById('infoContent');
    const previewContent = document.getElementById('previewContent');
    const previewOverlay = document.getElementById('previewOverlay');
    let content = '';

    // Use the type from the marker data to determine the template
    type = type.toUpperCase();

    switch (type) {
        default:
            content = `
                <h3>${data.name}</h3>
                <div style="margin-bottom: 25px;">
                    <i>${data.text}</i>
                </div>
                <!-- Tab buttons -->
                <div class="tab">
                    <button class="tablinks" onclick="openTab(event, 'txt_orig')">Transcription</button>
                    <button class="tablinks" onclick="openTab(event, 'txt_en')">English Translation</button>
                    <button class="tablinks" onclick="openTab(event, 'src_image')">Source</button>
                </div>
                
                  <!-- Tab content -->
                <div id="src_image" class="tabcontent">
                    <p>
                        <img src="https://www.e-manuscripta.ch/i3f/v21/${data.page_img}/full/pct:10/0/default.jpg"
                        alt="Source Image">
                    </p>
                    <p><a href="https://www.e-manuscripta.ch/bau/platter/content/zoom/${data.page_img}" target="_blank" class="unibas-link">> View full image</a></p>
                </div>
                
                <div id="txt_orig" class="tabcontent">
                    <p>${data.src_text_orig}</p>
                </div>
                
                <div id="txt_en" class="tabcontent">
                    <p>${data.src_text_translation}</p>
                </div>
                
               <div>
                 <!-- Placeholder for static bottom content -->
               </div>
            `;
            break;
    }

    infoContent.innerHTML = content;

    document.querySelectorAll('.select-marker').forEach(item => {
        item.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target-id');
            if (markersById[targetId]) {
                markersById[targetId].openPopup();
            }
        });
    });
}


/**
 * Function to create a marker with a specific icon and popup.
 * @param {object} markerGroup - The Leaflet map instance.
 * @param {string} type - The type of marker.
 * @param {object} markerData - An object containing data for the marker (type, coordinates, etc.).
 * @param {L.DivIcon} icon - The icon to use for the marker.
 */
function createMarker(markerGroup, type, markerData, icon) {
    const { id, label, x, y } = markerData;
    let coordinates = [x, y];
    let popupData = { "Label": label, "Id": id };

    // Create the marker with the SVG icon
    const marker = L.marker(coordinates, { icon: icon });
    marker.bindTooltip(label, {permanent:false, direction:"top"})
    marker.addTo(markerGroup);

    // Store the marker in the global object using its ID
    markersById[id] = marker;

    // Add a click event listener to the marker
    marker.on('click', function () {
        updateSidebarContent(markerData, type);
        document.querySelector(".tablinks").click();
    });
}


async function loadAllMarkers(map) {
    // Initialize layers directly in TYPES and CONNECTION_TYPES
    Object.keys(TYPES).forEach(typeKey => {
        TYPES[typeKey].layer = L.markerClusterGroup();
    });

    // Load markers and connections
    for (const typeKey in TYPES) {
        const { icon, layer } = TYPES[typeKey];
        const dataUrl = `static/data/${typeKey.toLowerCase()}.json`;

        try {
            const iconInstance = await createSvgIcon(icon, typeKey.toLowerCase());
            const data = await fetch(dataUrl).then(response => response.json());

            data.forEach(markerData => {
                createMarker(layer, typeKey, markerData, iconInstance);
            });

            // Check if layer is defined before adding to map
            if (layer) {
                layer.addTo(map);
                // Attach event listeners using jQuery
                $(`#toggle-${typeKey.toLowerCase()}`).on('click', function () {
                    toggleLayer(map, layer, this);
                });
            } else {
                console.error(`Layer for type ${typeKey} is not initialized.`);
            }

        } catch (error) {
            console.error(`Error loading marker data or icon for type ${typeKey}:`, error);
        }
    }
}





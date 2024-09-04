// markedMap.js
// Create a map with markers and connections between them

// Global object to keep track of markers by ID
const markersById = {};

//
const TYPES = {
    PEOPLE: {
        icon: 'static/icons/people.svg',
        color: '#7994c8',
        description: 'Show or hide the people working at the institute.'
    },
    INSTITUTE: {
        icon: 'static/icons/institute.svg',
        color: '#81ae71',
        description: 'Show or hide information about the institute and building.'
    },
    RESEARCH: {
        icon: 'static/icons/research.svg',
        color: '#bab17b',
        description: 'Show or hide research areas, projects and research groups.'
    },
    DIGITAL: {
        icon: 'static/icons/digital.svg',
        color: '#d68787',
        description: 'Show or hide digital projects and initiatives.'
    },
    STUDIES: {
        icon: 'static/icons/studies.svg',
        color: '#cc84f4',
        description: 'Show or hide study programs and courses.'
    },
    NEWS: {
        icon: 'static/icons/news.svg',
        color: '#616d8f',
        description: 'Show or hide news and events.'
    }
};

const CONNECTION_TYPES = {
    WORKS_ON: {
        color: 'blue',
        description: 'Show or hide work connections.',
        lineDescription: 'currently works on'
    },
    WORKED_ON: {
        color: 'green',
        description: 'Show or hide past work connections.',
        lineDescription: 'worked on'
    },
    DOCTORAL_ADVISOR: {
        color: 'red',
        description: 'Show or hide doctoral advisor connections.',
        lineDescription: 'is Doctoral advisor of'
    },
    PRINCIPAL_INVESTIGATOR: {
        color: 'purple',
        description: 'Show or hide principal investigator connections.',
        lineDescription: 'is Principal Investigator of'
    },
    TEACHES: {
        color: 'orange',
        description: 'Show or hide teaching connections.',
        lineDescription: 'teaches'
    },
    STUDIED: {
        color: 'brown',
        description: 'Show or hide past study connections.',
        lineDescription: 'studied'
    },
    DO_STUDY: {
        color: 'black',
        description: 'Show or hide study connections.',
        lineDescription: 'studies'
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

/**
 * Function to create a popup message based on the icon type.
 * @param {string} iconType - The type of the icon.
 * @param {object} data - Additional data for the popup content.
 * @returns {string} The HTML content for the popup.
 */
function createPopupContent(iconType, data) {
    const iconUrl = TYPES[iconType.toUpperCase()].icon;

    let content = `
        <div class="popup-content">
            
            <div class="popup-icon">
                <img src="${iconUrl}" alt="${iconType} icon">
            </div>
            <div class="popup-text">
                <p>${data.Label}</p>
            </div>
        </div>
    `;
    return content;
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
        case 'PEOPLE':
            content = `
                <div class="people-sidebar">
                    <div class="people-image">
                        <img src="static/images/portraits/${data.id}.jpg" alt="${data.label} portrait">
                    </div>
                    <div class="people-info">
                        <h3>${data.label}</h3>
                        <p><strong>Role:</strong> ${data.role}</p>
                        <p><i>${data.text}</i></p>
                    </div>
                </div>
            `;
            break;
        // Add more cases for other types if needed
        default:
            content = `
                <h3>${data.label}</h3>
                <p><i>${data.text}</i></p>
                <p><a href="${data.pageUrl}" target="_blank" class="unibas-link">> Visit Page</a></p>
            `;
            break;
    }

    // Add connections if present
    if (data.connections && data.connections.length > 0) {
        content += `<h4>Connections:</h4><ul class="connections-list">`;
        data.connections.forEach(connection => {
            const connectionType = CONNECTION_TYPES[connection.type.toUpperCase()]?.description || connection.type;
            const targetLabel = connection.target_label || connection.target;
            const connectionColor = CONNECTION_TYPES[connection.type.toUpperCase()]?.color || 'black';
            const sourceIcon = TYPES[type]?.icon;
            const sourceColor = TYPES[type]?.color || 'black';
            const targetIcon = TYPES[connection.target_type.toUpperCase()]?.icon;
            const targetColor = TYPES[connection.target_type.toUpperCase()]?.color || 'black';

            content += `
                <li class="connection-item">
                    <span class="connection-text">
                        <span class="badge select-marker" data-target-id="${data.id}" style="background-color: ${sourceColor}">${data.name}</span> 
                        ${connection.label}
                        <span class="badge select-marker" data-target-id="${connection.target}" style="background-color: ${targetColor}">${targetLabel}</span> 
                    </span>
                    <div class="connection-icons">
                        <img src="${sourceIcon}" alt="${type} icon" class="connection-icon select-marker" data-target-id="${data.id}">
                        <span class="connection-line" style="background-color: ${connectionColor};"></span>
                        <img src="${targetIcon}" alt="${connection.target_type} icon" class="connection-icon select-marker" data-target-id="${connection.target}">
                    </div>
                </li>
            `;
        });
        content += `</ul>`;
    }


    // Update the preview content with the corresponding image
    const imagePath = `static/images/screenshots/ss_${data.id}.png`;
    previewContent.style.backgroundImage = `url('${imagePath}')`;

    // Set the link for the page
    const pageUrl = data.pageUrl; // Make sure `data.url` contains the actual URL

    // Set click event to open the page in a new tab
    previewOverlay.onclick = function() {
        if (pageUrl) {
            window.open(pageUrl, '_blank');
        }
    };

    // Set the height of preview-content based on the image
    const img = new Image();
    img.onload = function() {
        previewContent.style.height = this.height + 'px';
    };
    img.src = imagePath;

    // Dynamically set the animation delay and restart animation
    const animationDuration = 10; // Duration of the scroll in seconds
    const animationDelay = 2; // Delay before the animation starts in seconds
    const scrollDistance = 50; // Percentage to scroll (50%)

    // Reset animation by changing the animation property
    previewContent.style.animation = 'none'; // Remove current animation
    previewContent.offsetHeight; // Trigger a reflow, flushing the CSS changes
    previewContent.style.animation = `scroll-animation ${animationDuration}s ${animationDelay}s linear infinite`;

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
    marker.addTo(markerGroup);

    // Store the marker in the global object using its ID
    markersById[id] = marker;

    // Create and bind the popup
    const popupContent = createPopupContent(type, popupData);
    marker.bindPopup(popupContent);

    // Add a click event listener to the marker
    marker.on('click', function () {
        updateSidebarContent(markerData, type);
    });
}


async function loadAllMarkers(map) {
    // Initialize layers directly in TYPES and CONNECTION_TYPES
    Object.keys(TYPES).forEach(typeKey => {
        TYPES[typeKey].layer = L.markerClusterGroup();
    });

    Object.keys(CONNECTION_TYPES).forEach(typeKey => {
        CONNECTION_TYPES[typeKey].layer = L.layerGroup();
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

                if (markerData.connections) {
                    markerData.connections.forEach(connection => {
                        // Check if the connection is secondary
                        if (!connection.is_secondary) {  // Only process primary connections
                            const connectionType = CONNECTION_TYPES[connection.type.toUpperCase()];
                            if (connectionType && connectionType.layer) {
                                const latlngs = [
                                    [markerData.x, markerData.y],
                                    connection.target_coordinates
                                ];
                                const connectionColor = connectionType.color || 'black'; // Default color
                                L.polyline(latlngs, { color: connectionColor }).addTo(connectionType.layer);
                            } else {
                                console.error(`Connection type ${connection.type} not found.`);
                            }
                        }
                    });
                }
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

    // Add connection layers to the map
    Object.keys(CONNECTION_TYPES).forEach(typeKey => {
        const layer = CONNECTION_TYPES[typeKey].layer;
        if (layer) {
            layer.addTo(map);
            $(`#toggle-${typeKey.toLowerCase()}`).on('click', function () {
                toggleLayer(map, layer, this);
            });
        } else {
            console.error(`Layer for connection type ${typeKey} is not initialized.`);
        }
    });
}





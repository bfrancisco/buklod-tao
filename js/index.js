// Import function to populate the edit form and to get initial partner/household data.
// `populateEditForm` is called when an edit action is triggered.
import {populateEditForm, getPartnersArray } from './firestore.js'; 
// Import core Firestore utility functions.
import {
  getDocIdByPartnerName, // Used to get a document ID by a 'partner_name', likely for SDECE.
  getDocByID,           // Used to fetch a specific document by its ID.
  setCollection,        // Sets the current Firestore collection to work with.
  getCollection,        // Gets a reference to the currently set collection.
  DB,                   // Firestore database instance.
  addEntry,             // Function to add a new document to Firestore.
  BUKLOD_RULES_TEST,    // Rules/schema for the Buklod Tao test collection.
} from './firestore_UNIV.js';
// Import universal map-related functions and the map instance.
import { addListeners, map } from './index_UNIV.js';
// Import Firebase SDK modules for Firestore.
import {
  getFirestore,
  collection,
  getDocs,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
// Import static data for evacuation centers.
import evacCenters from '/hardcode/evac-centers.json' with {type: 'json'};

// Get a reference to the current Firestore collection (set by index_UNIV.js or elsewhere).
var colRef = getCollection();

// Pan the map to a default location on load.
map.panTo(new L.LatLng(14.673, 121.11215));

// Add OpenStreetMap tile layer to the map.
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '© <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

// Add Esri geocoding search control to the map.
var searchControl = L.esri.Geocoding.geosearch().addTo(map);

// Layer group to hold search results or dynamic markers.
var results = L.layerGroup().addTo(map);
// Global popup instance for map clicks.
var popup = L.popup();

// Array to hold partner/household data, likely populated by getPartnersArray().
var partnersArray = getPartnersArray();

// Function to generate HTML content for a household marker's popup.
function onPinClick(doc) {
  // Variables for risk levels, extracted and split from combined string.
  var earthquake = doc.earthquake_risk;
  var earthquake_split = earthquake.split(' RISK: ');
  var earthquake1 = earthquake_split[0]; // Risk level (e.g., HIGH)
  var earthquake2 = earthquake_split[1]; // Risk description
  var fire = doc.fire_risk;
  var fire_split = fire.split(' RISK: ');
  var fire1 = fire_split[0];
  var fire2 = fire_split[1];
  var flood = doc.flood_risk;
  var flood_split = flood.split(' RISK: ');
  var flood1 = flood_split[0];
  var flood2 = flood_split[1];
  var landslide = doc.landslide_risk;
  var landslide_split = landslide.split(' RISK: ');
  var landslide1 = landslide_split[0];
  var landslide2 = landslide_split[1];
  var storm = doc.storm_risk;
  var storm_split = storm.split(' RISK: ');
  var storm1 = storm_split[0];
  var storm2 = storm_split[1];

  // HTML structure for the popup.
  let leaflet_html = `
  <div class="leafletPopupContainer" id="leafletModal">
    <div class="leafletHeader">
      <label>${doc.household_name}</label>
    </div>
    <div class="leafletContent">
      <br>
      <br>
      <div style="line-height: 1px;">
        <p>${doc.contact_number}</p>
        <p>${doc.household_address}</p>
      </div>
      <div class="modalLine" style="width: 100%">
        <label class="leafletLabel">Residency Status</label>
        <label class="leafletLabel">Part of HOA/NOA</label>
      </div>
      <div class="modalLine" style="line-height: 3px; margin-bottom: 2px; width: 180px;">
        <p class="leafletDetails">${doc.residency_status}</p>
        <p class="leafletDetails">${doc.is_hoa_noa}</p>
      </div>
      <div style="line-height: 3px; margin-bottom: 2px;">
        <label class="leafletLabel">Nearest Evacuation Area</label>
        <p class="leafletDetails">${doc.nearest_evac}</p>
      </div>
    <div>
      <div class="leafletSubHeader">
        <label>Risk Levels</label>
      </div>
      <div class="modalLine">
        <label class="leafletLabel">Earthquake</label>
        <label class="leafletLabel">${earthquake1}</label>
      </div>
      <div>
        <p class="leafletDetails">${earthquake2}</p>
      </div>
      <div class="modalLine">
        <label class="leafletLabel">Fire</label>
        <label class="leafletLabel">${fire1}</label>
      </div>
      <div>
        <p class="leafletDetails">${fire2}</p>
      </div>
      <div class="modalLine">
        <label class="leafletLabel">Flood</label>
        <label class="leafletLabel">${flood1}</label>
      </div>
      <div>
        <p class="leafletDetails">${flood2}</p>
      </div>
      <div class="modalLine">
        <label class="leafletLabel">Landslide</label>
        <label class="leafletLabel">${landslide1}</label>
      </div>
      <div>
        <p class="leafletDetails">${landslide2}</p>
      </div>
      <div class="modalLine">
        <label class="leafletLabel">Storm</label>
        <label class="leafletLabel">${storm1}</label>
      </div>
      <div>
        <p class="leafletDetails">${storm2}</p>
      </div>
    </div>
    <div>
      <div class="leafletSubHeader">
        <label>Residents</label>
      </div>
      <div class="modalLine">
        <label class="leafletLabel">Total</label>
        <label class="leafletLabel">${doc.number_residents}</label>
      </div>
      <hr style="border-top: 1px solid #CBD5E0;">
      <div class="modalLine">
        <label class="leafletLabel">Minors</label>
        <label class="leafletLabel">${doc.number_minors}</label>
      </div>
      <br>
      <div class="modalLine">
        <label class="leafletLabel">Seniors</label>
        <label class="leafletLabel">${doc.number_seniors}</label>
      </div>
      <br>
      <div class="modalLine">
        <label class="leafletLabel">PWD</label>
        <label class="leafletLabel">${doc.number_pwd}</label>
      </div>
      <br>
      <div class="modalLine">
        <label class="leafletLabel">Sick</label>
        <label class="leafletLabel">${doc.number_sick}</label>
      </div>
      <br>
      <div class="modalLine">
        <label class="leafletLabel">Pregnant</label>
        <label class="leafletLabel">${doc.number_pregnant}</label>
      </div>
      <!-- Edit button within the popup -->
      <button class="modalButton" id="editHouseholdPopup" name="submit_form" style="color:#3D97AF">Edit     <img src="./img/edit.png" alt="edit" style="height: 20px; width: 20px;"></button>
      </div>
    </div>
  </div>
  `;
  return leaflet_html;
}
// Initial loading of household data from Firestore.
getDocs(colRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((entry) => { // For each document snapshot in the query result.
      var doc = entry.data(); // Get the data object from the document.
      var marker = L.marker([0, 0]); // Initialize marker at a default location.

      // If location coordinates exist, create the marker at the specified latitude and longitude.
      if (doc.location_coordinates != null) {
        marker = L.marker([
          parseFloat(doc.location_coordinates._lat),
          parseFloat(doc.location_coordinates._long),
        ]);
      }
      // Generate popup content for the marker.
      var popupContent = onPinClick(doc);
      marker.bindPopup(popupContent); // Bind the generated HTML content to the marker's popup.
      // Event listener for when the popup is opened.
      marker.on('popupopen', function(e) {
        var editBtn = document.getElementById('editHouseholdPopup'); // Get the edit button from the popup.
        if (editBtn) {
          // Add click listener to the edit button.
          editBtn.addEventListener('click', function() {
            const modal = document.getElementById('partnerModal'); // Reference to an SDECE-specific partner modal, might not be relevant here.
            var editFormModal = document.getElementById('editModal'); // Get the modal for editing.
            editFormModal.style.display = 'block'; // Display the edit modal.
            if (modal) modal.style.display = 'none'; // Hide the SDECE partner modal if it was open.
            // Call function to populate the edit form with the current household's data.
            // `doc` is the data object of the household associated with this marker.
            // `entry.id` would be the document ID.
            populateEditForm(doc, editFormModal); 
          })
        }
      })
      results.addLayer(marker); // Add the marker to the 'results' layer group.
    });
  }).catch((error) => {
    console.error('Error getting documents: ', error);
  });

// Add markers for evacuation centers from the imported JSON data.
evacCenters.forEach(center => {
  const marker = L.marker(
    [center.latitude, center.longitude],
    {icon: L.icon({ // Custom icon for evacuation centers.
      iconUrl: "/hardcode/evac.svg",
      iconSize: [39,39],
      popupAnchor: [0.5, -15] // Adjust popup anchor relative to the icon.
    })}
  ).addTo(map); // Add marker directly to the map.

  // Bind popup to the evacuation center marker.
  marker.bindPopup(`
    <div class = "evac-marker-header">${center.type}</div>
    <div style = "text-align:center;">
      <b>${center.name}</b>
      <br>Location: ${center.latitude}, ${center.longitude}
    </div>`);
});

// Iterate over an array of partners/households (partnersArray) to add their markers.
// This seems to be an alternative way of adding markers if data is pre-fetched into partnersArray.
partnersArray.forEach((partner) => {
    var doc = partner; // The household/partner data object.
    var this_marker = partner.marker; // Assumes marker instance might already exist on the object.
    //console.log(doc);
    if (doc.location_coordinates != null) {
      this_marker = L.marker([ // Create marker if coordinates exist.
        parseFloat(doc.location_coordinates._lat),
        parseFloat(doc.location_coordinates._long),
      ]);
    }
    // Generate and bind popup content.
    var popupContent = onPinClick(doc);
    this_marker.bindPopup(popupContent);
    results.addLayer(this_marker); // Add to the results layer group.
    // Update the marker property on the partner object.
    Object.defineProperty(partner, "marker", {value:this_marker, configurable: true});
  });

// Add universal event listeners (e.g., for sidebar items).
addListeners();

// Function to handle map click events.
function onMapClick(e) {
  const lat = e.latlng.lat; // Latitude of the clicked point.
  const lng = e.latlng.lng; // Longitude of the clicked point.

  // HTML content for the popup displayed on map click.
  var popupContent = `
    <div class="partner-geolocation">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C11.337 11.5 10.7011 11.2366 10.2322 10.7678C9.76339 10.2989 9.5 9.66304 9.5 9C9.5 8.33696 9.76339 7.70107 10.2322 7.23223C10.7011 6.76339 11.337 6.5 12 6.5C12.663 6.5 13.2989 6.76339 13.7678 7.23223C14.2366 7.70107 14.5 8.33696 14.5 9C14.5 9.66304 14.2366 10.2989 13.7678 10.7678C13.2989 11.2366 12.663 11.5 12 11.5Z" fill="#91C9DB"/>
          </svg>
          ${lat} + ${lng}
          <br>
    </div>
    <button id="mainButton" class="addButton p-5" data-lat="${lat}" data-lng="${lng}">Add Household</button>`;

  // Set popup content and open it at the clicked location.
  popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

  // Add event listener to the "Add Household" button within the popup.
  var addButton = document.querySelector('.addButton');
  addButton.addEventListener('click', function () {
    const lat = this.getAttribute('data-lat'); // Get lat from button's data attribute.
    const lng = this.getAttribute('data-lng'); // Get lng from button's data attribute.

    var modal = document.getElementById('addModal'); // Get the "Add Household" modal.

    // TODO: Integrate this functionality into the modal instead of opening a new window.
    // var partnerName = this.getAttribute("data-loc");
    // window.open(
    //   `addloc.html?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
    //     lng
    //   )}`,
    //   "_blank"
    // );

    // Display the "Add Household" modal.
    modal.classList.remove('hidden'); // Assumes 'hidden' class controls visibility.
    modal.classList.add('flex');      // Assumes 'flex' class for display styling.

    // Pre-fill the location_coordinates field in the iframe of the addModal.
    modal.getElementsByTagName('iframe')[0].contentWindow.document.getElementById('location_coordinates').value = lat + '+' + lng;

 // Handle form submission for the "Add Household" modal.
  var addHouseholdFrom = document.getElementById('addHouseholdForm'); // This ID is inside the iframe.
  // The event listener for addHouseholdForm should be within addloc.html itself.
  // This current event listener setup here might lead to issues or multiple listeners.
  if (addHouseholdFrom) { // This check will likely fail as addHouseholdForm is in the iframe.
    addHouseholdFrom.addEventListener('submit', function (event) {
      event.preventDefault();

      // Data gathering and submission logic for adding a new household.
      // This is largely duplicated from what should be in addloc.html.
      const householdData = {
        household_name: document.getElementById('household_name').value,
        contact_number: document.getElementById('contact_number').value,
        household_address: document.getElementById('household_address').value,
        residency_status: document.getElementById('residency_status').value,
        is_hoa_noa: document.getElementById('is_hoa_noa').value,
        nearest_evac: document.getElementById('nearest_evac').value,
        earthquake_risk: document.getElementById('earthquake_risk').value,
        fire_risk: document.getElementById('fire_risk').value,
        flood_risk: document.getElementById('flood_risk').value,
        landslide_risk: document.getElementById('landslide_risk').value,
        storm_risk: document.getElementById('storm_risk').value,
        number_residents: document.getElementById('number_residents').value,
        number_minors: document.getElementById('number_minors').value,
        number_seniors: document.getElementById('number_seniors').value,
        number_pwd: document.getElementById('number_pwd').value,
        number_sick: document.getElementById('number_sick').value,
        number_pregnant: document.getElementById('number_pregnant').value,
        location_coordinates: new firebase.firestore.GeoPoint(parseFloat(lat), parseFloat(lng))
      };

      addDoc(colRef, householdData)
        .then(() => {
          alert('Household added successfully!');
          modal.classList.add('hidden');
          modal.classList.remove('flex');
          location.reload(); // Reload the map to show the new marker.
        })
        .catch((error) => {
          console.error('Error adding document: ', error);
        });
    });
  }


    // Close the modal when the user clicks anywhere outside of it.
    window.onclick = function (event) {
      if (event.target == modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };
  });
}

// Attach the onMapClick listener to the map.
map.on('click', onMapClick);

//// Event Listeners for search control.
searchControl.on('results', function (data) {
  console.log(data); // Log search results.
  results.clearLayers(); // Clear previous search result markers.
  // Add new markers for current search results.
  for (var i = data.results.length - 1; i >= 0; i--) {
    var marker = L.marker(data.results[i].latlng);
    //console.log(marker);
    results.addLayer(marker);
  }
});

//script for add household modal (general modal handling, somewhat redundant with onMapClick's modal logic).

// modal instance for adding.
var formModal = document.getElementById('addModal');

// open modal button
var openForm = document.getElementById('mainButton'); // 'mainButton' ID is used in map popup too.

// Get the <span> element that closes the modal (assumes a specific structure).
var closeForm = document.getElementsByClassName('closeForm')[0]; // Prone to issues if multiple elements.

// When the user clicks the button, open the modal.
if(openForm) { // Check if openForm element exists.
  openForm.onclick = function() {
    formModal.style.display = "block";
  }

  openForm.addEventListener('click', function () {
    formModal.style.display = 'block';
  });
}

if(closeForm) { // Check if closeForm element exists.
  closeForm.addEventListener('click', function () {
    formModal.style.display = 'none';
  });
}

// Closing the modal if the user clicks outside of it.
// This handles both addModal (formModal) and an SDECE partnerModal.
window.onclick = function (event) {
  if (event.target == formModal) { // If click is outside addModal.
    formModal.style.display = 'none';
  }
  const partnerModal = document.getElementById('partnerModal'); // Get partnerModal.
  if (partnerModal && event.target == partnerModal) { // If click is outside partnerModal.
    partnerModal.style.display = 'none';
  }
};

// Function to set text for a main button (if it exists).
function addMainButtonText() {
  var mainButtonText = document.getElementById('mainButtonText');
  if(mainButtonText) {
    mainButtonText.innerHTML = 'Add a household';
  }
}

addMainButtonText();
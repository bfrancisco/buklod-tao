import {} from './firestore.js';
import {
	getDocIdByPartnerName,
	getDocByID,
	setCollection,
	getCollection,
	DB,
	addEntry,
	BUKLOD_RULES_TEST,
} from './firestore_UNIV.js';
import { addListeners, map } from './index_UNIV.js';
import {
	getFirestore,
	collection,
	getDocs,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';

var colRef = getCollection();

map.panTo(new L.LatLng(14.673, 121.11215));

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution:
		'&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch().addTo(map);

var results = L.layerGroup().addTo(map);
var popup = L.popup();

// function to store the html for info display on pin click
function onPinClick(doc) {
  // Variables for risk levels
	var earthquake = doc.earthquake_risk;
	var earthquake_split = earthquake.split(' RISK: ');
	var earthquake1 = earthquake_split[0];
	var earthquake2 = earthquake_split[1];
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

	let leaflet_html = `
  <div class="leafletPopupContainer" id="leafletModal">
    <div class="leafletHeader">
      <label>${doc.household_name}</label>
    </div>
    <div class="leafletContent">
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
      </div>
    </div>
  </div>       
  `;
	return leaflet_html;
}

// Loads art the start
getDocs(colRef)
	.then((querySnapshot) => {
		querySnapshot.forEach((entry) => {
			var doc = entry.data();
			var marker = L.marker([0, 0]);
			if (doc.location_coordinates != null) {
				marker = L.marker([
					parseFloat(doc.location_coordinates._lat),
					parseFloat(doc.location_coordinates._long),
				]);
			}
			// shows partner info on pin click
			var popupContent = onPinClick(doc);
			marker.bindPopup(popupContent);
			results.addLayer(marker);
		});
	})
	.catch((error) => {
		console.error('Error getting documents: ', error);
	});

addListeners();

function onMapClick(e) {
	const lat = e.latlng.lat;
	const lng = e.latlng.lng;

	// This is the popup for when the user clicks on a spot on the map
	var popupContent = `
      <div class="partner-geolocation">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C11.337 11.5 10.7011 11.2366 10.2322 10.7678C9.76339 10.2989 9.5 9.66304 9.5 9C9.5 8.33696 9.76339 7.70107 10.2322 7.23223C10.7011 6.76339 11.337 6.5 12 6.5C12.663 6.5 13.2989 6.76339 13.7678 7.23223C14.2366 7.70107 14.5 8.33696 14.5 9C14.5 9.66304 14.2366 10.2989 13.7678 10.7678C13.2989 11.2366 12.663 11.5 12 11.5Z" fill="#91C9DB"/>
            </svg>
            ${lat} + ${lng}
            <br>
      </div>
    <button id="mainButton" class="addButton p-5" data-lat="${lat}" data-lng="${lng}">Add Household</button>
    `;

	popup.setLatLng(e.latlng).setContent(popupContent).openOn(map);

	var addButton = document.querySelector('.addButton');
	addButton.addEventListener('click', function () {
		const lat = this.getAttribute('data-lat');
		const lng = this.getAttribute('data-lng');

		var modal = document.getElementById('addModal');

		// TODO: Integrate this functionality into the modal instead
		// var partnerName = this.getAttribute("data-loc");
		// window.open(
		//   `addloc.html?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(
		//     lng
		//   )}`,
		//   "_blank"
		// );

		// Display the modal
		modal.classList.remove('hidden');
		modal.classList.add('flex');

    // Set the coordinates based on the pin drop
    modal.getElementsByTagName('iframe')[0].contentWindow.document.getElementById('location_coordinates').value = lat + '+' + lng;

 // Handle form submission
//  document.getElementById('addHouseholdForm').addEventListener('submit', function (event) {
//   event.preventDefault();
  
//   const householdData = {
//     household_name: document.getElementById('household_name').value,
//     contact_number: document.getElementById('contact_number').value,
//     household_address: document.getElementById('household_address').value,
//     residency_status: document.getElementById('residency_status').value,
//     is_hoa_noa: document.getElementById('is_hoa_noa').value,
//     nearest_evac: document.getElementById('nearest_evac').value,
//     earthquake_risk: document.getElementById('earthquake_risk').value,
//     fire_risk: document.getElementById('fire_risk').value,
//     flood_risk: document.getElementById('flood_risk').value,
//     landslide_risk: document.getElementById('landslide_risk').value,
//     storm_risk: document.getElementById('storm_risk').value,
//     number_residents: document.getElementById('number_residents').value,
//     number_minors: document.getElementById('number_minors').value,
//     number_seniors: document.getElementById('number_seniors').value,
//     number_pwd: document.getElementById('number_pwd').value,
//     number_sick: document.getElementById('number_sick').value,
//     number_pregnant: document.getElementById('number_pregnant').value,
//     location_coordinates: new firebase.firestore.GeoPoint(parseFloat(lat), parseFloat(lng))
//   };

//   addDoc(colRef, householdData)
//     .then(() => {
//       alert('Household added successfully!');
//       modal.classList.add('hidden');
//       modal.classList.remove('flex');
//       location.reload(); // Reload the map to show the new marker
//     })
//     .catch((error) => {
//       console.error('Error adding document: ', error);
//     });
// });


		// Close the modal when the user clicks anywhere outside of it
		window.onclick = function (event) {
			if (event.target == modal) {
				modal.classList.add('hidden');
				modal.classList.remove('flex');
			}
		};
	});
}

map.on('click', onMapClick);

//// Event Listeners
searchControl.on('results', function (data) {
	console.log(data);
	results.clearLayers();
	for (var i = data.results.length - 1; i >= 0; i--) {
		var marker = L.marker(data.results[i].latlng);
		//console.log(marker);
		results.addLayer(marker);
	}
});

//script for add household modal

// modal
var formModal = document.getElementById('addModal');

// open modal
var openForm = document.getElementById('mainButton');

// Get the <span> element that closes the modal
var closeForm = document.getElementsByClassName('closeForm')[0];

// When the user clicks the button, open the modal
openForm.onclick = function() {
   formModal.style.display = "block";
}

openForm.addEventListener('click', function () {
	formModal.style.display = 'block';
});

closeForm.addEventListener('click', function () {
  formModal.style.display = 'none';
});

// Closing the modal if the user clicks outside of it
window.onclick = function (event) {
	if (event.target == formModal) {
		formModal.style.display = 'none';
	}
	if (event.target == partnerModal) {
		partnerModal.style.display = 'none';
	}
};

function addMainButtonText() {
	var mainButtonText = document.getElementById('mainButtonText');
	mainButtonText.innerHTML = 'Add a household';
}

addMainButtonText();

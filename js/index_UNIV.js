import {
	DB_RULES_AND_DATA,
	getDocByID,
	getDocIdByPartnerName,
	getCollection,
} from '/js/firestore_UNIV.js';

// Global Map Variable (the map shown)
export var map = L.map('map').setView([14.5995, 120.9842], 10);

// Takes in a name to determine all field values which should be displayed
// Current Issue: it doesn't display all the added things, could be due to the async nature of these functions
export function getDivContent(name) {
	var div_content = ``; // This isn't affected, this is the one getting printed
	return getDocIdByPartnerName(name).then((docId) => {
		if (docId) {
			return getDocByID(docId).then((doc) => {
				// Insert the partner details into the div with class "partner-contact"
				for (let rule of DB_RULES_AND_DATA) {
					if (getCollection().id === rule[0]) {
						div_content += `<div class="partner-contact"> <div class="partner-label"> ${doc.get(
							rule[1]
						)} </div>`;
						for (let i = 0; i < rule[2].length; i++) {
							if (rule[2][i].includes('coordinates')) {
								div_content += `<div class="partner-activity"> ${readyField(
									rule[2][i]
								)}: ${
									doc.get(rule[2][i]).latitude +
									' + ' +
									doc.get(rule[2][i]).longitude
								}`;
								continue;
							}
							div_content += `<div class="partner-activity"> ${readyField(
								rule[2][i]
							)}: ${doc.get(rule[2][i])}`;
						}
						div_content += `</div>`;
						break;
					}
				}
				return div_content;
			});
		} else {
			div_content = 'no partner';
			return div_content;
		}
	});
}

function panLocation(doc, map) {
	for (let rule of DB_RULES_AND_DATA) {
		if (getCollection().id === rule[0]) {
			var coordinates;
			for (let i = 0; i < rule[2].length; i++) {
				if (rule[2][i].includes('location_coordinates')) {
					coordinates = doc.get(rule[2][i]);
					if(coordinates != null) {
						map.panTo(
							new L.LatLng(
								coordinates.latitude,
								coordinates.longitude
							)
						);
					}
					break;
				}
			}
		}
	}
}

function searchLocation(name, map) {
	getDocIdByPartnerName(name).then((docId) => {
		getDocByID(docId).then((doc) => {
			panLocation(doc, map);
		});
	});
}

// Utility Function for Front-end (remove underscores from a string)
export function removeUnderscoresFromField(field) {
	const words = field.replace('_', ` `);
	return words;
}

// Utility function for Front-end (Capitalize Like This)
// USE AFTER removeUnderscoresFromField
export function capitalizeFirstLetters(field) {
	const words = field.split(' ');
	for (let i = 0; i < words.length; i++) {
		words[i] = words[i].charAt(0).toUpperCase() + words[i].substr(1);
	}
	return words.join(' ');
}

// Utility function for Front-end
export function readyField(field) {
	field = removeUnderscoresFromField(field);
	field = capitalizeFirstLetters(field);
	return field;
}

// Listeners
export function addListeners() {
	var locationList = document.getElementById(`locationList`);
	locationList.addEventListener('click', (event) => {
		searchLocation(event.target.innerHTML, map);
	});
}

export function clearMarkers() {
	map.eachLayer((layer) => {
		if (layer instanceof L.Marker) {
			layer.remove();
		}
	});
}

export function clearLocationList() {
	var locationList = document.getElementById(`locationList`);
	locationList.innerHTML = '';
}

// code for the switching of maps
export const JS_CS_ENGINE = [
	[
		'buklod-official',
		[
			'buklod-tao-branch/js/index.js',
			'buklod-tao-branch/js/firestore.js',
			'buklod-tao-branch/css/form.css',
			//   'buklod-tao-branch/css/login.css',
			'buklod-tao-branch/css/main.css',
		],
	],
	[
		'buklod-official-TEST',
		[
			'buklod-tao-branch/js/index.js',
			'buklod-tao-branch/js/firestore.js',
			'buklod-tao-branch/css/form.css',
			//   'buklod-tao-branch/css/login.css',
			'buklod-tao-branch/css/main.css',
		],
	],
	[
		'sdece-official',
		[
			'sdece/js/index.js',
			'sdece/js/firestore.js',
			'sdece/css/form.css',
			'sdece/css/modal.css',
		],
	],
	[
		'sdece-official-TEST',
		[
			'sdece/js/index.js',
			'sdece/js/firestore.js',
			'sdece/css/form.css',
			'sdece/css/modal.css',
		],
	],

];

// creates the JS CSS Files
export function createJsCssFiles(file_path) {
	// Essentially makes a script object with a src of the file provided by the Rules Engine
	if (file_path.includes('.js')) {
		var fileref = document.createElement('script');
		fileref.setAttribute('type', 'module');
		fileref.setAttribute('src', file_path + '?');
	}
	if (file_path.includes('.css')) {
		var fileref = document.createElement('link');
		fileref.setAttribute('rel', 'stylesheet');
		fileref.setAttribute('type', 'text/css');
		fileref.setAttribute('href', file_path + '?');
	}

	return fileref;
}

// Loads the JS CSS Files
export function loadJsCssFiles(file_path) {
	// script if javascript, css if link or none;
	for (let rule of JS_CS_ENGINE) {
		if (rule[0] == getCollection().id) {
			for (let i = 0; i < rule[1].length; i++) {
				var new_element = createJsCssFiles(rule[1][i]);
				new_element.setAttribute('id', 'jscss' + i);
				document
					.getElementsByTagName('head')[0]
					.appendChild(new_element);
			}
		}
	}
}

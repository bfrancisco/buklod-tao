// Import necessary Firestore modules and functions.
import {
	getDocs,
	addDoc,
	updateDoc,
	doc,
	query,
	where,
	getDoc,
	GeoPoint, // Firestore GeoPoint class for location data.
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';

// Firebase app initialization module.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';

// Firestore database and collection modules.
import {
	getFirestore,
	collection,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';

// Utility function to get URL parameters
function getUrlParameter(name) {
	name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	var results = regex.exec(location.search);
	return results === null
		? ''
		: decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Get lat and lng from URL parameters 
const lat = getUrlParameter('lat');
const lng = getUrlParameter('lng');

// Commented out: Example of displaying lat/lng on page load.
// document.addEventListener('DOMContentLoaded', function () {
// 	document.getElementById(
// 		'location-info'
// 	).innerText = `Latitude: ${lat}, Longitude: ${lng}`;
// });

// Commented out: Old getCoordinates function.
// export function getCoordinates() {
// 	var roundLat = parseFloat(lat.toFixed(5));
// 	var roundLon = parseFloat(lon.toFixed(5));
//  var PARTNER_COORDINATES = `(${roundLat}, ${roundLon})`;
//  return PARTNER_COORDINATES;
// }

// Function to convert a string of coordinates (e.g., "lat+lng") into a Firestore GeoPoint object.
export function getCoordinates(coordinates) { // Accepts a string argument 'coordinates'.
	var arr = coordinates.split('+'); // Splits the string by the '+' delimiter.
	var lat = arr[0], lng = arr[1]; // Assigns parts to lat and lng.
	// Ensure lat and lng are numbers.
	const latNum = parseFloat(lat);
	const lngNum = parseFloat(lng);

	// Round the numbers to 5 decimal places 
	var roundLat = parseFloat(latNum.toFixed(5));
	var roundLon = parseFloat(lngNum.toFixed(5));

	const GEOPOINT = new GeoPoint(roundLat, roundLon); // Creates a new GeoPoint object.

	var PARTNER_COORDINATES = GEOPOINT; // Assigns the GeoPoint.
	return PARTNER_COORDINATES; // Returns the GeoPoint object.
}

// Load Firebase configuration from a local secrets.json file.
const SECRETS_PATH = "/secrets.json";
const SECRETS_REQ = new Request(SECRETS_PATH);
const SECRETS_RES = await fetch(SECRETS_REQ);
const SECRETS = await SECRETS_RES.json();

export const firebaseConfig = SECRETS.firebaseConfig; // Firebase configuration object.

// Initialize Firebase app with the loaded configuration.
initializeApp(firebaseConfig);
export const DB = getFirestore(); // Get Firestore database instance.

var collection_reference = null; // Holds a reference to the current Firestore collection being used.

//export let partnersArray = []; // Used for holding fetched data, currently unused.

// Defines the structure (collection name, identifier field, list of fields) for different data collections.
// This acts as a rule engine for data operations.
export const DB_RULES_AND_DATA = [
	// ["collection_name", "identifier_field_name", ["field1", "field2", ..., "fieldN"]];
	[
		'buklod-official', // Production collection for Buklod Tao households.
		'household_name',  // Identifier field for Buklod Tao households.
		[ // List of fields for Buklod Tao households.	
			'contact_number',
			'earthquake_risk',
			'fire_risk',
			'flood_risk',
			'household_address',
			'household_material',
			'household_name',
			'household_phase',
			'is_hoa_noa',
			'landslide_risk',
			'location_coordinates',
			'location_link',
			'nearest_evac',
			'number_minors',
			'number_pregnant',
			'number_pwd',
			'number_residents',
			'number_seniors',
			'number_sick',
			'residency_status',
			'sickness_present',
			'status',
			'storm_risk',
		],
	],
	[
		'buklod-official-TEST', // Test collection for Buklod Tao households.
		'household_name',
		[ // List of fields for Buklod Tao households.
			'contact_number',
			'earthquake_risk',
			'fire_risk',
			'flood_risk',
			'household_address',
			'household_material',
			'household_name',
			'household_phase',
			'is_hoa_noa',
			'landslide_risk',
			'location_coordinates',
			'location_link',
			'nearest_evac',
			'number_minors',
			'number_pregnant',
			'number_pwd',
			'number_residents',
			'number_seniors',
			'number_sick',
			'residency_status',
			'sickness_present',
			'status',
			'storm_risk',
		],
	],
	[
		'sdece-official', // Production collection for SDECE partners/activities.
		'partner_name',   // Identifier field for SDECE.
		[ // List of fields for SDECE partners/activities.
			'activity_date',
			'activity_name',
			'activity_nature',
			'additional_partnership',
			'ADMU_contact_name',
			'ADMU_email',
			'ADMU_office',
			'organization_unit',
			'partner_address',
			'partner_contact_name',
			'partner_coordinates',
			'partner_email',
			'partner_name',
			'partner_contact_number',
		],
	],
	[
		'sdece-official-TEST', // Test collection for SDECE.
		'partner_name',
		[ // List of fields for SDECE partners/activities.
			'activity_date',
			'activity_name',
			'activity_nature',
			'additional_partnership',
			'ADMU_contact_name',
			'ADMU_email',
			'ADMU_office',
			'organization_unit',
			'partner_address',
			'partner_contact_name',
			'partner_coordinates',
			'partner_email',
			'partner_name',
			'partner_contact_number',
		],
	],
];

// Defines validation rules for data fields within specific collections.
const VALIDATION_RULES = {
	//Rules for Validating Data for 'buklod-official-TEST' collection.
	'buklod-official-TEST': { // Collection name for testing.
		contact_number: {
			type: 'string',
			required: true,
			minLength: 13,
			maxLength: 13,
			regex: /^[0-9 ]+$/,
		},
		earthquake_risk: { type: 'string', required: true },
		fire_risk: { type: 'string', required: true },
		flood_risk: { type: 'string', required: true },
		household_address: { type: 'string', required: true, maxLength: 255 },
		household_material: {
			type: 'string',
			required: true,
			enum: [
				'Concrete',
				'Semi-Concrete',
				'Light materials',
				'Makeshift',
				'Natural',
			],
		},
		household_name: { type: 'string', required: true, maxLength: 127 },
		household_phase: { type: 'string', required: true },
		is_hoa_noa: {
			type: 'string',
			required: true,
			minLength: 3,
			maxLength: 3,
			enum: ['HOA', 'N/A'],
		},
		landslide_risk: { type: 'string', required: true },
		// location_coordinates: { type: 'string', required: true }, // Was string, GeoPoint handled differently.
		location_link: { type: 'string', required: true },
		nearest_evac: { type: 'string', required: true, maxLength: 255 },
		number_minors: { type: 'number' },
		number_pregnant: { type: 'number' },
		number_pwd: { type: 'number' },
		number_residents: { type: 'number', required: true },
		number_sick: { type: 'number' },
		residency_status: {
			type: 'string',
			required: true,
			enum: ['May-Ari', 'Umuupa'],
		},		
		status: { type: 'string' },
		storm_risk: { type: 'string', required: true },
	},
	'buklod-official': { // Production collection for Buklod Tao households.
		contact_number: {
			type: 'string',
			required: true,
			minLength: 13,
			maxLength: 13,
			regex: /^[0-9 ]+$/,
		},
		earthquake_risk: { type: 'string', required: true },
		fire_risk: { type: 'string', required: true },
		flood_risk: { type: 'string', required: true },
		household_address: { type: 'string', required: true, maxLength: 255 },
		household_material: {
			type: 'string',
			required: true,
			enum: [
				'Concrete',
				'Semi-Concrete',
				'Light materials',
				'Makeshift',
				'Natural',
			],
		},
		household_name: { type: 'string', required: true, maxLength: 127 },
		household_phase: { type: 'string', required: true },
		is_hoa_noa: {
			type: 'string',
			required: true,
			minLength: 3,
			maxLength: 3,
			enum: ['HOA', 'N/A'],
		},
		landslide_risk: { type: 'string', required: true },
		location_coordinates: { type: 'number', required: true },
		location_link: { type: 'string', required: true },
		nearest_evac: { type: 'string', required: true, maxLength: 255 },
		number_minors: { type: 'number' },
		number_pregnant: { type: 'number' },
		number_pwd: { type: 'number' },
		number_residents: { type: 'number', required: true },
		number_sick: { type: 'number' },
		residency_status: {
			type: 'string',
			required: true,
			enum: ['May-Ari', 'Umuupa'],
		},
		status: { type: 'string' },
		storm_risk: { type: 'string', required: true },
	},
	'sdece-official-TEST': { // Test collection for SDECE.
		partner_name: { type: 'string', required: true, maxLength: 255 },
		partner_address: { type: 'string', required: true, maxLength: 255 },
		partner_coordinates: { required: true },
		partner_contact_name: {
			type: 'string',
			required: true,
			maxLength: 255,
		},
		partner_contact_number: {
			type: 'string',
			required: true,
			minLength: 13,
			maxLength: 13,
			regex: /^[0-9 ]+$/,
		},
		partner_email: { type: 'string', required: true, maxLength: 127 },
		activity_name: { type: 'string', required: true },
		activity_nature: { type: 'string', required: true, maxLength: 255 },
		activity_date: { type: 'date', required: true },
		additional_partnership: { type: 'string', maxLength: 255 },
		organization_unit: { type: 'string', maxLength: 127 },
		ADMU_office: { type: 'string', required: true, maxLength: 127 },
		ADMU_contact_name: { type: 'string', required: true, maxLength: 255 },
		ADMU_email: {
			type: 'string',
			required: true,
			required: true,
			maxLength: 127,
		},
	},
	'sdece-official': { // Production collection for SDECE.
		partner_name: { type: 'string', required: true, maxLength: 255 },
		partner_address: { type: 'string', required: true, maxLength: 255 },
		partner_coordinates: { required: true },
		partner_contact_name: {
			type: 'string',
			required: true,
			maxLength: 255,
		},
		partner_contact_number: {
			type: 'string',
			required: true,
			minLength: 13,
			maxLength: 13,
			regex: /^[0-9 ]+$/,
		},
		partner_email: { type: 'string', required: true, maxLength: 127 },
		activity_name: { type: 'string', required: true },
		activity_nature: { type: 'string', required: true, maxLength: 255 },
		activity_date: { type: 'date', required: true },
		additional_partnership: { type: 'string', maxLength: 255 },
		organization_unit: { type: 'string', maxLength: 127 },
		ADMU_office: { type: 'string', required: true, maxLength: 127 },
		ADMU_contact_name: { type: 'string', required: true, maxLength: 255 },
		ADMU_email: {
			type: 'string',
			required: true,
			required: true,
			maxLength: 127,
		},
	},
};

// Export specific rule sets for easier access.
export const BUKLOD_RULES = DB_RULES_AND_DATA[0];
export const BUKLOD_RULES_TEST = DB_RULES_AND_DATA[1];
export const SDECE_RULES = DB_RULES_AND_DATA[2];
export const SDECE_RULES_TEST = DB_RULES_AND_DATA[3];

// Commented out: Old setCollection implementation.
// export function setCollection(collection_name){
//     for(let rule of DB_RULES_AND_DATA ){
//         if (rule[0] === collection_name){
//             collection_reference = collection( DB, collection_name );
//         }
//     }
// }

// Sets the global 'collection_reference' based on the provided collection name.
export function setCollection(collection_name) {
	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_name) { // Finds the matching rule.
			collection_reference = collection(DB, collection_name); // Creates Firestore collection reference.
		}
	}
}

// Returns the currently set global collection reference.
export function getCollection() {
	return collection_reference;
}

// Retrieves the document ID for a given partner name (SDECE specific).
// Assumes 'partner_name' is the identifier field as per DB_RULES_AND_DATA.
export function getDocIdByPartnerName(partner_name) {
	const endName = partner_name.replace(/\s/g, '\uf8ff'); // For Firestore string range queries.

	// Loop through rules to find the one matching the current collection_reference.
	for (let rule of DB_RULES_AND_DATA) {
		if (collection_reference.id === rule[0]) { // Checks if current collection matches rule.
			// Queries Firestore for documents where the identifier field (rule[1]) matches partner_name.
			return getDocs(
				query(
					collection_reference,
					where(rule[1], '>=', partner_name), 
					where(rule[1], '<=', partner_name + endName)
				)
			)
				.then((querySnapshot) => {
					if (!querySnapshot.empty) {
						// Assuming there is only one document with the given partner name.
						const doc = querySnapshot.docs[0];
						return doc.id; // Returns the ID of the first matching document.
					} else {
						return null; // No matching document found.
					}
				})
				.catch((error) => {
					console.error('Error getting documents: ', error);
					return null;
				});
		}
	}
}

// Retrieves all documents matching a partner name (SDECE specific).
export function getDocsByPartnerName(partner_name) {
	const endName = partner_name.replace(/\s/g, '\uf8ff');
	for (let rule of DB_RULES_AND_DATA) {
		if (collection_reference.id === rule[0]) {
			return getDocs(
				query(
					collection_reference,
					where(rule[1], '>=', partner_name),
					where(rule[1], '<=', partner_name + endName)
				)
			)
				.then((querySnapshot) => {
					if (!querySnapshot.empty) {
						const docs = querySnapshot.docs; // Returns an array of document snapshots.
						return docs;
					} else {
						return null;
					}
				})
				.catch((error) => {
					console.error('Error getting documents: ', error);
					return null;
				});
		}
	}
}

// Retrieves a specific document by its ID from the currently set collection.
export function getDocByID(docId) { // `docId` is the ID of the document to fetch.
	// Loop through rules to find the one matching the current collection_reference.
	// This loop is somewhat redundant if setCollection() has already correctly set collection_reference.
	for (let rule of DB_RULES_AND_DATA) {
		if (collection_reference.id === rule[0]) { // Ensure operating on the correct collection.
			const DOC_REFERENCE = doc(DB, rule[0], docId); // Creates a document reference.
			let docObj = {}; // Placeholder, not strictly needed as getDoc returns snapshot.
			return getDoc(DOC_REFERENCE).then((docSnapshot) => { // Asynchronously fetches the document.
				docObj = docSnapshot; // Assigns the DocumentSnapshot.
				return docSnapshot; // Returns the DocumentSnapshot.
			});
		}
	}
}

// Adds a new entry (document) to the currently set collection.
export function addEntry(inp_obj) { // `inp_obj` contains the data for the new document.
	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_reference.id) { // Match current collection with rule.
			let input = {}; // Object to hold filtered data based on rules.
			// Iterate over keys in inp_obj to ensure only defined fields are added.
			// This assumes inp_obj keys directly match rule[2] field names and order.
			// TODO: iterate rule[2] and get values from inp_obj.
			for (let i = 0; i < Object.keys(inp_obj).length; i++) {
				// This mapping might be fragile if inp_obj keys don't align perfectly with rule[2] order.
				input[rule[2][i]] = inp_obj[rule[2][i]]; 
			}
			addDoc(collection_reference, input) // Adds the document to Firestore.
				.then((docRef) => {
					alert("You may now reload the page for your addition to reflect on this page");
				})
				.catch((error) => {
					console.error('Error adding document: ', error);
					alert("Error uploading new activity. Please try again");
				});
			break; // Exit loop once the matching rule is processed.
		}
	}
}

// Updates an existing entry (document) in the currently set collection.
export function editEntry(inp_obj, docId) { // `inp_obj` has updated data, `docId` is the ID of document to update.
	for (let rule of DB_RULES_AND_DATA) {
		if (rule[0] === collection_reference.id) { // Match current collection with rule.
			const DOC_REFERENCE = doc(DB, rule[0], docId); // Get reference to the specific document.
			updateDoc(DOC_REFERENCE, inp_obj) // Updates the document with data from inp_obj.
				.then(() => {
					alert("You may now reload the page for your edit to reflect on this page");
				})
				.catch((error) => {
					console.error('Error updating document: ', error); 
					alert("Error uploading the edited activity. Please try again");
				});
			break; // Exit loop.
		}
	}
}

// Validates data object against rules defined for a specific collection.
export function validateData(collectionName, data) {
	const rules = VALIDATION_RULES[collectionName]; // Get validation rules for the collection.
	var errors = []; // Array to store validation error messages.
	// Predefined labels for fields to make error messages more user-friendly.
	const fieldLabels = {
		'activity_name': 'Activity Name',
		'activity_nature': 'Nature of Activity',
		'activity_date': 'Date of Partnership',
		'additional_partnership': 'Additional Partnership',
		'organization_unit': 'Organization Unit',
		'partner_name': 'Name of Host Partner',
		'partner_address': 'Address of Host Partner',
		'partner_contact_name': 'Name of Contact Person',
		'partner_contact_number': 'Number of Contact Person',
		'partner_email': 'Email of Contact Person / Partner',
		'partner_coordinates': 'Partner Coordinates',
		'ADMU_office': 'Name of Office',
		'ADMU_contact_name': 'Name of Ateneo Contact Person',
		'ADMU_email': 'Email of Ateneo Contact Person'
	};


	// Iterate over each field defined in the validation rules for the collection.
	for (const field in rules) {
		const rule = rules[field]; // Current field's validation rule.
		const value = data[field]; // Value of the field from the input data.
		const fieldLabel = fieldLabels[field] || field; // User-friendly label for the field.

		// Check for required field: if rule says required and value is missing/empty.
		if ( rule.required && (value == undefined || value == null || value == '') ) {
			errors.push(`${fieldLabel} is required.`);
			continue; // Skip further checks for this field.
		} 
		
		// Commented out: Debugging for valid fields.
		// else {
		// 	errors.push("Field is valid!");
		// }

		// Skip type validation if field is not required and is empty/missing.
		if ( !rule.required && (value == undefined || value == null || value == '') ) {
			continue;
		}

		// Check field type if specified in rules.
		if (rule.type) {
			if (rule.type === 'date') { // Specific validation for date type.
				const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format.
				if (!dateRegex.test(value)) {
					errors.push( `${fieldLabel} must be a valid date in YYYY-MM-DD format.`);
					continue;
				}
				const date = new Date(value);
				if (isNaN(date.getTime())) { // Check if date is valid.
					errors.push(`${fieldLabel} must be a valid date.`);
					continue;
				}
			} else if (typeof value != rule.type) { // General type check.
				errors.push( `${fieldLabel} must be of type ${rule.type}.`);
				continue;
			}
		}

		// Check for minimum length for string types.
		if ( rule.minLength && typeof value == 'string' && value.length < rule.minLength ) {
			if (field === 'partner_contact_number') { // Custom message for contact number.
				errors.push( `${fieldLabel} must be at least ${rule.minLength} characters long and in the form 09XX XXX XXXX.`);
			} else {
				errors.push( `${fieldLabel} must be at least ${rule.minLength} characters long.`);
			}
			continue;
		}

		// Check for maximum length for string types.
		if ( rule.maxLength && typeof value == 'string' && value.length > rule.maxLength ) {
			errors.push( `${fieldLabel} cannot exceed ${rule.maxLength} characters.`);
			continue;
		}

		// Check against regular expression pattern if defined.
		if (rule.regex && !rule.regex.test(value)) {
			errors.push(`${fieldLabel} is invalid.`);
			continue;
		}

		// Check if value is one of the enumerated values if defined.
		if (rule.enum && !rule.enum.includes(value)) {
			errors.push( `${fieldLabel}' must be one of ${rule.enum.join(',')}.`);
			continue;
		}
		//no validation for geolocation, url yet
	}
	return errors; // Returns array of error messages, empty if no errors.
}
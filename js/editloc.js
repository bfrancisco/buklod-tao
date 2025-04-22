import { editEntry, getDocIdByPartnerName, getDocByID, getDocsByPartnerName} from "./firestore_UNIV.js";

// function populateFormFields(partnerData) {
// 		document.getElementById("partner").value = partnerData.name;
// 		document.getElementById("partner_contact-person").value = partnerData["`partner-contact`"];
// 		document.getElementById("organization").value = partnerData.org;
// 		document.getElementById("nature_of_act").value = partnerData.activity;
// 		document.getElementById("dates_of_partnership").value = partnerData.dates;
// 		document.getElementById("ateneo_office").value = partnerData["`admu-office`"];
// 		document.getElementById("ateneo_contact-person").value = partnerData["`admu-contact`"];
// 		document.getElementById("ateneo_contact-email").value = partnerData["`admu-email`"];
// }

// function fetchPartnerData() {
// 		const params = new URLSearchParams(window.location.search);
// 		const partnerName = params.get("partnerName");
// 		if (partnerName) {
// 				getDocIdByPartnerName(partnerName)
// 						.then((docId) => {
// 								if (docId) {
// 										getDocByID(docId).then((doc) => {
// 												populateFormFields(doc);
// 										});
// 								}
// 								else {
// 										alert("No matching document found for the partner name: " + partnerName);
// 								}
// 						});
// 		}
// 		else {
// 				alert("No partnerName parameter found in the URL.");
// 		}
// }
//fetchPartnerData();

document.getElementById("submit_form").addEventListener("click", handleFormSubmit);

/**
 * Retrieves data from a form, processes it,and updates an entry in a database
 * based on the form input and partner name.
 */
async function handleFormSubmit() {
		var partner_name = parent.document.getElementsByClassName("modal-name")[0].innerHTML

		var docId = await getDocIdByPartnerName(partner_name)
		getDocsByPartnerName(partner_name)
			.then((querySnapshot) => {
				var doc = querySnapshot[0].data()
				var collatedInput = {};
				for (var fieldName in doc) {
					var inputValue = document.getElementById(fieldName).value
					if (fieldName == 'number_residents' || fieldName == 'location_coordinates' || fieldName == 'number_minors' || fieldName == 'number_pregnant' || fieldName == 'number_pwd' || fieldName == 'number_sick') {
							if (fieldName == 'location_coordinates') {
									//collatedInput[fieldName] = getCoordinates();
									collatedInput[fieldName] = inputValue;
							} else {
									collatedInput[fieldName] = Number(inputValue);
							}
					}
					if(fieldName.includes('risk')){
							let riskType = fieldName.split('_')
							collatedInput[fieldName] = `${document.getElementById(riskType[0]).value.toUpperCase()} RISK: ${document.getElementById(fieldName).value}`;
					}
					else {
							collatedInput[fieldName] = inputValue;
					}

				}
				editEntry(collatedInput, docId)
			})
}
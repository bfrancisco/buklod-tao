// FIRESTORE DATABASE

import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js';
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
  getDoc,
} from 'https://www.gstatic.com/firebasejs/9.18.0/firebase-firestore.js';
import { getCollection, setCollection } from './firestore_UNIV.js';
// Your Firestore code here

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyA8QWgic_hjbDL-EYIkvSRRII_yfTRdtOQ',
  authDomain: 'discs-osci-prj.firebaseapp.com',
  projectId: 'discs-osci-prj',
  storageBucket: 'discs-osci-prj.appspot.com',
  messagingSenderId: '601571823960',
  appId: '1:601571823960:web:1f1278ecb86aa654e6152d',
  measurementId: 'G-9N9ELDEMX9',
};
initializeApp(firebaseConfig);
const db = getFirestore();
setCollection('buklod-official');
const colRef = getCollection();
let partnersArray = [];

export function getDocIdByPartnerName(partnerName) {
  const endName = partnerName.replace(/\s/g, '\uf8ff');
  return getDocs(
    query(
      colRef,
      where('household_name', '>=', partnerName),
      where('household_name', '<=', partnerName + endName)
    )
  )
    .then((querySnapshot) => {
      console.log(querySnapshot);
      if (!querySnapshot.empty) {
        // Assuming there is only one document with the given partner name
        const doc = querySnapshot.docs[0];
        return doc.id;
      } else {
        console.log('EMPTY: No matching document found.');
        return null;
      }
    })
    .catch((error) => {
      console.error('Error getting documents: ', error);
      return null;
    });
}

export function getDocByID(docId) {
  const docReference = doc(db, 'nstp-3', docId);
  let docObj = {};
  return getDoc(docReference).then((doc) => {
    docObj = doc.data();
    return docObj;
  });
}

// get docs from firestore

export function getPartnersArray() {
  return partnersArray;
}

getDocs(colRef)
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      if (
        doc.data().name !== 'Test 2' ||
        doc.data().name !== 'Test2'
      ) {
        partnersArray.push(doc.data());
      }
    });

    // populate ul with partners
    partnersArray.forEach((partner) => {
      // Creating DOM elements
      const containerDiv = document.createElement('div');
      const img = document.createElement('svg');
      const listItem = document.createElement('li');
      const anchor = document.createElement('a');
      const nameDiv = document.createElement('div');
      const addressDiv = document.createElement('div');
      var locationList = document.getElementById(`locationList`);

      // Set attributes
      anchor.href = '#';

      anchor.addEventListener('click', () => {
        showModal(partner);
      });

      // Adding classes and setting text content
      nameDiv.classList.add('name');
      addressDiv.classList.add('address');

      nameDiv.textContent = partner.household_name;
      addressDiv.textContent =
        partner.household_address + ' ' + partner.household_phase;

      listItem.classList.add('accordion');
      anchor.classList.add('accordion', 'link');
      containerDiv.classList.add('container-entry');

      // Append elements to the DOM
      anchor.appendChild(nameDiv);
      anchor.appendChild(addressDiv);

      listItem.appendChild(anchor);
      containerDiv.appendChild(img);
      containerDiv.appendChild(listItem);
      if (locationList) {
        locationList.appendChild(containerDiv);
      }
    });
  })
  .catch((error) => {
    console.error('Error getting documents: ', error);
  });

function showModal(partner) {
  const modal = document.getElementById('partnerModal');
  const modalHeader = document.getElementById('modalHeader');
  const modalContent = document.getElementById('modalContent');

  // Clear previous content
  modalHeader.innerHTML = '';
  modalContent.innerHTML = '';

  // Variables for risk levels
  var earthquake = partner.earthquake_risk;
  var earthquake_split = earthquake.split(' RISK: ');
  var earthquake1 = earthquake_split[0];
  var earthquake2 = earthquake_split[1];
  var fire = partner.fire_risk;
  var fire_split = fire.split(' RISK: ');
  var fire1 = fire_split[0];
  var fire2 = fire_split[1];
  var flood = partner.flood_risk;
  var flood_split = flood.split(' RISK: ');
  var flood1 = flood_split[0];
  var flood2 = flood_split[1];
  var landslide = partner.landslide_risk;
  var landslide_split = landslide.split(' RISK: ');
  var landslide1 = landslide_split[0];
  var landslide2 = landslide_split[1];
  var storm = partner.storm_risk;
  var storm_split = storm.split(' RISK: ');
  var storm1 = storm_split[0];
  var storm2 = storm_split[1];

  // Manual Calculation of Resident Adults
  var number_adult = partner.number_residents - (partner.number_minors+partner.number_seniors)

  // Create div elements for each piece of information
  const nameDiv = document.createElement('div');
  const partnerContentDiv = document.createElement('div');

  // The HTML content of the side bar partner information popup modal
  let partner_content = `
    <br>
      <div>
        <p class="modalText" id="entry_contact_number" style="margin-top: -5px;">${partner.contact_number}</p>
        <p class="modalText" id="entry_address">${partner.household_address}</p>
      </div>
      <div class="modalLine">
        <label class="modalLabel" style="width: 220px;">Residency Status</label>
        <label class="modalLabel" style="width: 220px;">Part of HOA / NOA</label>
      </div>
      <div class="modalLine">
        <p class="modalText" id="entry_residency_status" style="width: 220px;">${partner.residency_status}</p>
        <p class="modalText" id="entry_HOA/NOA" style="width: 220px;">${partner.is_hoa_noa}</label>
      </div>
      <div>
        <label class="modalLabel">Nearest Evacuation Area</label>
        <p class="modalText" id="entry_nearest_evacuation_area">${partner.nearest_evac}</p>
      </div>
    <button type="button" class="collapsible">Risk Levels</button>
      <div class="colContent" style="display: block;">
        <div class="modalLine">
          <label class="modalLabel">Earthquake</label>
          <label class="modalLabel" id="entry_earthquake_risk_level">${earthquake1}</label>
        </div>
        <div>
          <p class="modalText" id="entry_earthquake_desc">${earthquake2}</p>
        </div>
        <div class="modalLine">
          <label class="modalLabel">Fire</label>
          <label class="modalLabel" id="entry_fire_risk_level">${fire1}</label>
        </div>
        <div>
          <p class="modalText" id="entry_fire_desc">${fire2}</p>
        </div>
        <div class="modalLine">
          <label class="modalLabel">Flood</label>
          <label class="modalLabel" id="entry_flood_risk_level">${flood1}</label>
        </div>
        <div>
          <p class="modalText" id="entry_flood_desc">${flood2}</p>
        </div>
        <div class="modalLine">
          <label class="modalLabel">Landslide</label>
          <label class="modalLabel" id="entry_landslide_risk_level">${landslide1}</label>
        </div>
        <div>
          <p class="modalText" id="entry_landslide_desc">${landslide2}</p>
        </div>
        <div class="modalLine">
          <label class="modalLabel">Storm</label>
          <label class="modalLabel" id="entry_storm_risk_level">${storm1}</label>
        </div>
        <div>
          <p class="modalText" id="entry_storm_desc">${storm2}</p>
        </div>
      </div>
    <button type="button" class="collapsible">Residents</button>
      <div class="colContent" style="display: block;">
        <br>
        <div class="modalLine">
          <label class="modalLabel">Total</label>
          <label class="modalLabel" id="entry_number_of_residents">${partner.number_residents}</label>
        </div>
        <hr style="border-top: 1px solid #CBD5E0; margin-top:10px;">
        <div class="modalLine" style="margin-top: 10px;">
          <label class="modalLabel">Minors</label>
          <label class="modalLabel" id="entry_number_of_minor_residents">${partner.number_minors}</label>
        </div>
        <br>
        <div class="modalLine">
          <label class="modalLabel">Adults</label>
          <label class="modalLabel" id="entry_number_of_adult_residents">${number_adult}</label>
        </div>
        <br>
        <div class="modalLine">
          <label class="modalLabel">Seniors</label>
          <label class="modalLabel" id="entry_number_of_senior_residents">${partner.number_seniors}</label>
        </div>
        <br>
        <div class="modalLine">
          <label class="modalLabel">PWD</label>
          <label class="modalLabel" id="entry_number_of_pwd_residents">${partner.number_pwd}</label>
        </div>
        <br>
        <div class="modalLine">
          <label class="modalLabel">Sick</label>
          <label class="modalLabel" id="entry_number_of_sick_residents">${partner.number_sick}</label>
        </div>
        <br>
        <div class="modalLine">
          <label class="modalLabel" >Pregnant</label>
          <label class="modalLabel" id="entry_number_of_pregnant_residents">${partner.number_pregnant}</label>
        </div>
        <br>
      </div>
  `;

  // styling
  nameDiv.classList.add("modal-name");

  // Set the content of each div
  nameDiv.textContent = partner.household_name;
  partnerContentDiv.innerHTML = partner_content;

  // Append the div elements to the modal content
  modalHeader.appendChild(nameDiv);
  modalContent.appendChild(partnerContentDiv);

  // Provides logic and styling for collapsing sections
  var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
      coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var colContent = this.nextElementSibling;
        if (colContent.style.display === "block") {
          colContent.style.display = "none";
          coll.style.transform = "none";
        } else {
          colContent.style.display = "block";
          coll.style.transform = "rotate(180deg)";
        }
      });
    }

  // Show the modal
  modal.style.display = 'block';

  // Close the modal when the close button is clicked
  const closeButton = document.getElementsByClassName('close')[0];
  closeButton.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  // Close the modal when the user clicks outside of it
  window.addEventListener('click', (event) => {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  });

  //script for edit household modal

  // modal
  var editFormModal = document.getElementById('editModal');

  // open modal
  var openEditForm = document.getElementById('editHousehold');

  // Get the <span> element that closes the modal
  var closeEditForm = document.getElementById('close-btn');

  // When the user clicks the button, open the modal
  if(openEditForm) {
    openEditForm.onclick = function () {
      editFormModal.style.display = 'block';
      modal.style.display = 'none';
      populateEditForm(partner, editFormModal)
    };
  }

  // When the user clicks on <span> (x), close the modal
  if(closeEditForm) {
    closeEditForm.onclick = function () {
      editFormModal.style.display = 'none';
    };
  }
}

export function addEntry(data) {
  data.forEach((entry) => {
    addDoc(colRef, entry)
      .then((docRef) => {
        console.log('Document written with ID: ', docRef.id);
      })
      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  });
}

/**
 * The function `populateEditForm` populates an edit form with data from a
 * partner object, handling different data formats appropriately.
 *
 * Parameters
 * ----------
 * partner
 *    The `partner` parameter in the `populateEditForm` function is an object
 * that contains information about a partner. This information includes details
 * such as risk assessments, location coordinates, and other relevant data. The
 * function iterates over the properties of the `partner` object and populates
 * the corresponding sections in the edit form
 *
 * editFormModal
 *    The `editFormModal` parameter is a reference to the modal element that
 * contains the form for editing partner information. The function
 * `populateEditForm` populates this form with data from the `partner` object.
 */
export function populateEditForm(partner, editFormModal) {
  var iframe = editFormModal.getElementsByClassName('formIframe')[0]
  var editForm = iframe.contentWindow.document

  for (var data in partner) {
    if (data.includes('risk')) {
      var risk, details
      var assessment = partner[data].toString().split(':')
      var riskType = data.split('_')

      if (Array.isArray(assessment) && assessment.length > 1) {
        risk = assessment[0].split(' ')[0].toLowerCase()
        details = assessment[1].slice(1)
      } else {
        risk = ''
        details = assessment[0]
      }

      editForm.getElementById(riskType[0]).value = risk
      editForm.getElementById(data.toString()).value = details
    } else if (partner[data] instanceof Object) {
      editForm.getElementById(data.toString()).value = partner[data]._lat + " " + partner[data]._long
    } else {
      if (partner[data] != null) {
        editForm.getElementById(data.toString()).value = partner[data].toString();
      } else {
        editForm.getElementById(data.toString()).value = '';
      }
    }
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const associatesTable = document.getElementById("associates-table");
  const rows = associatesTable.getElementsByTagName("tr");

  fetchAssociates(); // show associate info when page is loaded
  addAssociate(); // add new associate and save to db.json
  removeAssociates(); // remove associate and update to db.json
  updateAssociateTraining(); // update training for associate and save to db.json
  addAssignment(); // add associate to a work assignment and update to db.json

  function fetchassociates() {
    fetch("http://localhost:3000/associates")
      .then((response) => response.json())
      .then((associates) =>
        associates.forEach((associate) => {
          createassociateElement(associate);
        })
      );
  }

  // make associate table
  function createassociateElement(associate) {
    let associateRow = document.createElement("tr");
    let nameCell = document.createElement("td");
    let loginCell = document.createElement("td");
    let trainingCell = document.createElement("td");
    nameCell.textContent = associate.name;
    loginCell.textContent = associate.login;
    trainingCell.textContent = associate.training;

    associateRow.append(nameCell, loginCell, trainingCell);
    associatesTable.appendChild(associateRow);
  }

});

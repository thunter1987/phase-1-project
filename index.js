document.addEventListener("DOMContentLoaded", () => {
  const associatesTable = document.getElementById("associates-table");
  const rows = associatesTable.getElementsByTagName("tr");

  fetchAssociates(); // show associate info when page is loaded
  addAssociate(); // add new associate and save to db.json
  removeAssociates(); // remove associate and update to db.json
  updateAssociateTraining(); // update training for associate and save to db.json
  addAssignment(); // add associate to a work assignment and update to db.json

  function fetchAssociates() {
    fetch("http://localhost:3000/associates")
      .then((response) => response.json())
      .then((associates) =>
        associates.forEach((associate) => {
          createAssociateElement(associate);
        })
      );
  }

  // make associate table
  function createAssociateElement(associate) {
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
  function addAssociate() {
    const addAssociateForm = document.getElementById("add-associate-form");

    addAssociateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let associateName = document.getElementById("associate-name");
      let associateLogin = document.getElementById("associate-login");
      let associateSkill = document.getElementById("associate-skill");

      // loop through row of table
      for (let i = 0; i < rows.length; i++) {
        let nameCell = rows[i].querySelectorAll("td")[0];
        let loginCell = rows[i].querySelectorAll("td")[1];

        // check if name exists
        if (nameCell && nameCell.textContent === associateName.value) {
          alert("associate name already exist");
          return;
        }
        // check if login exists
        if (loginCell && loginCell.textContent === associateLogin.value) {
          alert("associate login already exists");
          return;
        }
      }

      let newAssociate = {
        name: associateName.value,
        login: associateLogin.value,
        training: associateTraining.value,
      };

      // call function saveAssociate
      saveAssociate(newAssociate);
      addAssociateForm.reset();
    });
  }

  function saveAssociate(newAssociate) {
    //  check if the skill field is a string and convert it to an array before saving it to the database
    if (typeof newAssociate.skill === "string") {
      newAssociate.skill = [newAssociate.skill];
    }
    // use POST method to update new associate to db.json
    fetch("http://localhost:3000/associates", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(newAssociate),
    })
      .then((response) => response.json())
      .then((associate) => createAssociateElement(associate)); // call function createassociateElement to create new associate
  }
});

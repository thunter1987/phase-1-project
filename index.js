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
      let associateTraining = document.getElementById("associate-training");

      // loop through row of table
      for (let i = 0; i < rows.length; i++) {
        let nameCell = rows[i].querySelectorAll("td")[0];
        let loginCell = rows[i].querySelectorAll("td")[1];

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

      saveAssociate(newAssociate);
      addAssociateForm.reset();
    });
  }

  function saveAssociate(newAssociate) {
    //  convert training string into an array before saving it to the database
    newAssociate.training = [newAssociate.training];

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
      .then((associate) => createAssociateElement(associate));
  }

  function removeAssociates() {
    const removeAssociateBtn = document.getElementById(
      "remove-associate-button"
    );

    removeAssociateBtn.addEventListener("click", (event) => {
      event.preventDefault();

      // get associate login value
      let associateLogin = document.getElementById(
        "associate-login-remove"
      ).value;

      fetch(`http://localhost:3000/associates?login=${associateLogin}`) // //retrieve the associate with the specified login
        .then((response) => response.json())
        .then((associates) => {
          // if associate login value is invalid, we can not fetch, the return by json will be empty
          if (associates.length === 0) {
            alert("Invalid associate login");
          }

          // only one associate match the associate login, so we can access the first associate object return by json
          let associateId = associates[0].id;
          console.log(associateId);

          // use associate ID to fetch data and DELETE method to delete that associate
          fetch(`http://localhost:3000/associates/${associateId}`, {
            method: "DELETE",
          })
            .then((response) => response.json())
            .then((removedAssociate) => {
              removeAssociateRow(associateLogin); // call removeAssociateRow to remove associate from table
              console.log(removedAssociate);
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    });
  }

  function removeAssociateRow(associateLogin) {
    // Loop through each row of the table
    for (let i = 0; i < rows.length; i++) {
      // Get the cell containing the login of the associate in row at td[1]
      let loginCell = rows[i].querySelectorAll("td")[1];

      if (loginCell && loginCell.textContent === associateLogin) {
        rows[i].remove();
        break;
      }
    }
  }
});

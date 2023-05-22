document.addEventListener("DOMContentLoaded", () => {
  const associatesTable = document.getElementById("associates-table");
  const rows = associatesTable.getElementsByTagName("tr");

  fetchAssociates();
  addAssociate(); // add new associate and save to db.json
  removeAssociates(); // remove associate and update to db.json
  updateAssociateTraining(); // update new training for associate and save to db.json
  addWork(); // add associate to a work position and update to db.json

  // make associate table
  function createAssociateElement(associate) {
    let associateRow = document.createElement("tr");
    let nameCell = document.createElement("td");
    let loginCell = document.createElement("td");
    let trainingCell = document.createElement("td");
    let positionCell = document.createElement("td");
    nameCell.textContent = associate.name;
    loginCell.textContent = associate.login;
    trainingCell.textContent = associate.training;
    positionCell.textContent = associate.position;

    associateRow.append(nameCell, loginCell, trainingCell, positionCell);
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
        let loginCell = rows[i].querySelectorAll("td")[1];

        // check if login exists
        if (loginCell && loginCell.textContent === associateLogin.value) {
          alert("Associate login already exists");
          return;
        }
      }

      let newAssociate = {
        name: associateName.value,
        login: associateLogin.value,
        training: associateTraining.value,
        position: [""],
      };
      // call function saveAssociate
      saveAssociate(newAssociate);
      addAssociateForm.reset();
    });
  }

  function saveAssociate(newAssociate) {
    //  check if the training field is a string and convert it to an array before saving it to the database
    if (typeof newAssociate.training === "string") {
      newAssociate.training = [newAssociate.training];
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
      .then((associate) => createAssociateElement(associate)); // call function createAssociateElement to create new associate
  }

  function removeAssociates() {
    let associateLogin = document.getElementById("associate-login")
    let removeAssociateBtn = document.getElementById(
      "remove-associate-button"
    );
    removeAssociateBtn.textContent = "Delete Associate"

    removeAssociateBtn.addEventListener("mouseover", () => {
      // Sets the originalColor property of the button to its original color
      removeAssociateBtn.originalColor = removeAssociateBtn.style.color;
      // changes the button's text color to red.
      removeAssociateBtn.style.color = "red";
    });

    removeAssociateBtn.addEventListener("mouseout", () => {
      // Resets the button's text color to its original color.
      removeAssociateBtn.style.color = removeAssociateBtn.originalColor;
    });
    removeAssociateBtn.addEventListener("click", (event) => {
     event.preventDefault();
      // get associate login value
      removeAssociateRow(associateLogin)
      removeAssociate(associateLogin)
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

  function updateAssociateTraining() {
    const updateAssociateForm = document.getElementById(
      "update-associate-form"
    );

    updateAssociateForm.addEventListener("submit", (event) => {
      event.preventDefault();
      // get the values of associate login and new training from the form
      let associateLogin = document.getElementById("associate-login").value;
      let associateTrainingUpdate = document.getElementById(
        "associate-training-update"
      ).value;

      fetch(`http://localhost:3000/associates?login=${associateLogin}`) //retrieve the associate with the specified login
        .then((response) => response.json())
        .then((associates) => {
          if (associates.length < 8) {
            alert("Invalid associate login");
          }
          // only one associate match the associate login, so we can access the first associate object return by json
          let associate = associates[0];
          let trainings = associate.training;
          console.log(trainings);

          if (!trainings.includes(associateTrainingUpdate)) {
            // if the new training is not already in the trainings list, add it
            trainings.push(associateTrainingUpdate);

            updateAssociate(associate.id, { training: trainings }); // call function updateAssociate
          } else {
            alert("Training already exist");
          }
        })
        .catch((error) => console.log("Error fetching:", error));
      updateAssociateForm.reset();
    });
  }

  function updateAssociate(associateId, updateData) {
    // Make a PATCH request using associate Id
    return fetch(`http://localhost:3000/associates/${associateId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(updateData),
    })
      .then((response) => response.json())
      .then(
        ((updatedAssociate) => {
          // Pass the updated associate object to the updateAssociateRow function
          updateAssociateRow(updatedAssociate);
        }).catch((error) => console.log(`Error fetching:`, error))
      );
  }

  function updateAssociateRow(associate) {
    // Loop through each row of the table
    for (let i = 0; i < rows.length; i++) {
      // Get the cell containing the login of the associate in row at td[1]
      let loginCell = rows[i].querySelectorAll("td")[1];

      if (loginCell && loginCell.textContent === associate.login) {
        // Update the training cell of the current row with the updated training
        rows[i].querySelectorAll("td")[2].textContent = associate.training;
        let positionRow = rows[i].querySelectorAll("td")[3].textContent;
        positionRow.textContent = associate.position;
        break;
      }
    }
    // This function retrieves all the associates from the database and returns an array of positions where associates are currently assigned to work.
  }

  // This function handle adding a new work to an associate.
  function addWork() {
    const addWorkForm = document.getElementById("add-work-form");

    addWorkForm.addEventListener("submit", (event) => {
      event.preventDefault();
      //  call the getPositionArray() function, which retrieves an array of all assigned positions from the server.
      getPositionArray()
        .then((workPosition) => {
          console.log(workPosition);
          let associateLogin = document.getElementById("associate-login").value;
          let position = addWorkForm.getElementById("position").value;
          // position value, for example is titan-1, so we need to split it and get the first index only
          let positionName = position.split("-")[0];
          updateAssociate;
          //retrieve the associate with the specified login
          // check if position name is not in trainings
          if (!trainings.includes(positionName)) {
            alert(
              `This associate does not have training to work at ${positionName}`
            );
          }
          // check if position is already assigned
          else if (workPosition.includes(position)) {
            alert(`${position} has been already assigned to another associate`);
          }
          // if workPosition return true. that means this associate already assigned to a work position
          else if (workPosition) {
            alert(`This associate is already at ${workPosition}`);
            // if associate is not assigned to a position
          } else {
            workPosition = position;
          }
        })
        .catch((error) => console.log("Error fetching:", error));
      addWorkForm.reset();
    });
  }
  function fetchAssociates() {
    fetch("http://localhost:3000/associates")
      .then((res) => res.json())
      .then((associatesData) =>
        associatesData.forEach((associate) => createAssociateElement(associate))
      );
  }
  function removeAssociate(associateLogin) {
    fetch(`http://localhost:3000/associates/${associateLogin}`, {
        method: 'DELETE',
        })
    
        .then(res => res.json())
        .then(associate => console.log(associate))
  }
})

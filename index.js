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
            alert("Invalid Associate login");
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
              removeAssociateRow(associateLogin);
              console.log(removedAssociate);
            })
            .catch((error) => console.log(error));
        })
        .catch((error) => console.log(error));
    });
  }

  function removeAssociateRow(associateLogin) {
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
      // get the values of Associate login and new training from the form
      let associateLogin = document.getElementById(
        "associate-login-update"
      ).value;
      let associateTrainingUpdate = document.getElementById(
        "associate-training-update"
      ).value;

      fetch(`http://localhost:3000/associates?login=${associateLogin}`) //retrieve the associate with the specified login
        .then((response) => response.json())
        .then((associates) => {
          if (associates.length === 0) {
            alert("Invalid Associate login");
          }
          // only one associate match the associate login, so we can access the first associate object return by json
          let associate = associates[0];
          let trainings = associate.training;
          console.log(trainings);

          if (trainings.includes(associateTrainingUpdate)) {
            alert("Associate Training already exists");
          } else {
            // if the new training is not already in the trainings list, add it
            trainings.push(associateTrainingUpdate);

            updateAssociate(associate.id, { training: trainings });
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
      .then((updatedAssociate) => {
        // Pass the updated Associate object to the updateAssociateRow function
        updateAssociateRow(updatedAssociate);
      })
      .catch((error) => console.log(`Error fetching:`, error));
  }

  function updateAssociateRow(associate) {
    // Loop through each row of the table
    for (let i = 0; i < rows.length; i++) {
      // Get the cell containing the login of the associate in row at td[1]
      let loginCell = rows[i].querySelectorAll("td")[1];

      if (loginCell && loginCell.textContent === associate.login) {
        // Update the training cell of the current row with the updated training
        rows[i].querySelectorAll("td")[2].textContent = associate.training;
        break;
      }
    }
  }
  // This function retrieves all the associates from the database and returns an array of assignments where associates are currently assigned to work.
  function getAssignmentArray() {
    return fetch("http://localhost:3000/associates")
      .then((response) => response.json())
      .then((associates) => {
        let assignments = [];
        associates.forEach((associate) => {
          if (associate.assignment) {
            assignments.push(associate.assignment);
          }
        });
        return assignments;
      });
  }
  // This function handle adding a new work to an associate.
  function addAssignment() {
    const addAssignmentForm = document.getElementById("add-work-form");

    addAssignmentForm.addEventListener("submit", (event) => {
      event.preventDefault();
      //  call the getAssignmentArray() function, which retrieves an array of all assigned assignments from the server.
      getAssignmentArray().then((assignedAssignment) => {
        console.log(assignedAssignment);
        let associateLogin = document.getElementById(
          "associate-login-add-work"
        ).value;
        let assignmentName = document.getElementById("assignment").value;

        fetch(`http://localhost:3000/associates?login=${associateLogin}`)
          .then((response) => response.json())
          .then((associates) => {
            if (associates.length === 0) {
              alert("Invalid associate login");
            }

            let associate = associates[0];
            let trainings = associate.training;
            let workAssignment = associate.assignment;
            // check if assignment name is not in trainings
            if (!trainings.includes(assignmentName)) {
              alert(
                `This associate does not have training to work at ${assignmentName}`
              );
            }
            // if workAssignment return true. that means this associate already assigned to a work assignment
            else if (workAssignment) {
              alert(`This associate is already at ${workAssignment}`);
              // if associate is not assigned to a assignment
            } else {
              workAssignment = assignmentName;
              // call function updateAssociate
              updateAssociate(associate.id, { assignment: workAssignment }).then(() => {
                // update the list of associates at each assignment
                displayAssociateAtAssignment();
              });
            }
          })
          .catch((error) => console.log("Error fetching:", error));
        addAssignmentForm.reset();
      });
    });
  }

});

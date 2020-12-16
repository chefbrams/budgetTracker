let db;

// request to open a database called budget, version 1
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
  // Save database interface
  const db = event.target.result;
  //    creates object store called pending
  db.createObjectStore("pending", { autoIncrement: true });
};

// if request is successful then save interface
request.onsuccess = function (e) {
  db = e.target.result;
  // Now check of app is online before reading database;
  if (navigator.onLine) {
    checkDatabase();
  }
};

// if error event occurs consol log error;
request.onerror = function (e) {
  console.log("ERROR" + e.target.errorCode);
};

// allow read/write access to the object store

function saveRecord(record) {
  const transaction = db.transaction(["pending"], "readwrite");
  // allow acces to the object store
  const store = transaction.objectStore("pending");

  // add record to index
  store.add(record);
}

function checkDatabase() {
  const transaction = db.transaction(["pending"], "readwrite");
  // allow acces to the object store
  const store = transaction.objectStore("pending");

  // get all records from pending
  const getAll = store.getAll();
  // if successful then run post route, allow read/write access, allow access, clear items
  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch("/api/transactioni/bulk", {
        method: "POST",
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json"
        }
      })
        .then(response => response.json())
        .then(() => {
          const transaction = db.transaction(["pending"], "readwrite");
          const store = transaction.objectStore("pending");
          store.clear();
        });
    }
  };
}

// listen for app to come online
window.addEventListener("online", checkDatabase);

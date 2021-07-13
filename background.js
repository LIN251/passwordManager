chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'insert') {
    let res = insert_records(request.payload)
    res.then(res => {
        chrome.runtime.sendMessage({
            message: "insert_success",
            payload: res
        })
    })
  }
  else if (request.message === 'get'){
   let insert_res = get_record(request.payload)
    insert_res.then(res => {
        chrome.runtime.sendMessage({
            message: "get_success",
            payload: reinsert_ress
        })
    })

  }
  else if (request.message === 'update'){
   let update_res = update_record(request.payload)
    update_res.then(res => {
        chrome.runtime.sendMessage({
            message: "update_success",
            payload: res
        })
    })

  }
  else if (request.message === 'delete'){
   let delete_res = delete_record(request.payload)
    delete_res.then(res => {
        chrome.runtime.sendMessage({
            message: "delete_success",
            payload: res
        })
    })

  }else if (request.message === 'getAll'){
   let getAll_res = all_records()
    getAll_res.then(res => {
        chrome.runtime.sendMessage({
            message: "getAll_success",
            payload: res
        })
    })

  }
});

/******************** database operations ********************/  
    let db = null;
    function create_database() {
        const request = window.indexedDB.open('passwordManagerDB');
        request.onerror = function (event) {
            console.log("Problem opening passwordManagerDB.");
        }
        request.onupgradeneeded = function (event) {
            db = event.target.result;
            let record = db.createObjectStore("record", { autoIncrement : true });
            let secret = db.createObjectStore("secret", { autoIncrement : true });
            record.transaction.oncomplete = function (event) {
                console.log("record Created.");
            }
            secret.transaction.oncomplete = function (event) {
                console.log("secret Created.");
            }
        }
        request.onsuccess = function (event) {
            db = event.target.result;
            console.log("DB OPENED.");
        }
    }

    // // ne 
    // function delete_database() {
    //     const request = window.indexedDB.deleteDatabase('passwordManagerDB');
    //     request.onerror = function (event) {
    //         console.log("Problem delete passwordManagerDB.");
    //     }
    //     request.onsuccess = function (event) {
    //         console.log("DB deleted.");
    //     }
    // }


    function insert_records(records) {
        if (db) {
            const insert_transaction = db.transaction(["record","secret"], "readwrite");
            const objectStore = insert_transaction.objectStore("record");

            return new Promise((resolve, reject) => {
                insert_transaction.oncomplete = function () {
                    console.log("ALL INSERT TRANSACTIONS COMPLETE.");
                    resolve(true);
                }

                insert_transaction.onerror = function () {
                    console.log("PROBLEM INSERTING RECORDS.")
                    resolve(false);
                }

                records.forEach(info => {
                    let request = objectStore.add(info);

                    request.onsuccess = function () {
                        console.log("Added: ", info);
                    }
                    request.onerror = function () {
                        console.log("Fail add: ", info);
                    }
                });
            });
        }
    }


    function get_record(id) {
        console.log("get recored")
        if (db) {
            const get_transaction = db.transaction("record", "readonly");
            const objectStore = get_transaction.objectStore("record");

            return new Promise((resolve, reject) => {
                get_transaction.oncomplete = function () {
                    console.log("ALL GET TRANSACTIONS COMPLETE.");
                }

                get_transaction.onerror = function () {
                    console.log("PROBLEM GETTING RECORDS.")
                }

                let res = objectStore.get(id);

                res.onsuccess = function (event) {
                    resolve(event.target.result);
                }
            });
        }
    }


    function update_record(record) {
        if (db) {
            const put_transaction = db.transaction("record", "readwrite");
            const objectStore = put_transaction.objectStore("record");

            return new Promise((resolve, reject) => {
                put_transaction.oncomplete = function () {
                    console.log("ALL PUT TRANSACTIONS COMPLETE.");
                    resolve(true);
                }

                put_transaction.onerror = function () {
                    console.log("PROBLEM UPDATING RECORDS.")
                    resolve(false);
                }

                objectStore.put(record);
            });
        }
    }


    function all_records() {
        if (db) {
            const put_transaction = db.transaction("record", "readonly");
            const objectStore = put_transaction.objectStore("record");
            
            return new Promise((resolve, reject) => {
                put_transaction.oncomplete = function () {
                    console.log("ALL PUT TRANSACTIONS COMPLETE.");
                    resolve(true);
                }

                put_transaction.onerror = function () {
                    console.log("PROBLEM UPDATING RECORDS.")
                    resolve(false);
                }

                let res = objectStore.getAll();

                res.onsuccess = function (event) {
                    resolve(event.target.result);
                }


            });
        }
    }


    function delete_record(id) {
        if (db) {
            const delete_transaction = db.transaction("record", 
            "readwrite");
            const objectStore = delete_transaction.objectStore("record");

            return new Promise((resolve, reject) => {
                delete_transaction.oncomplete = function () {
                    console.log("ALL DELETE TRANSACTIONS COMPLETE.");
                    resolve(true);
                }

                delete_transaction.onerror = function () {
                    console.log("PROBLEM DELETE RECORDS.")
                    resolve(false);
                }

                objectStore.delete(id);
            });
        }
    }

    create_database();
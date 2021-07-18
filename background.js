chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'insert') {
    let res = insert_records(request.table,request.payload)
    res.then(res => {
        chrome.runtime.sendMessage({
            message: "insert_success",
            payload: res
        })
    })
  }
  else if (request.message === 'get'){
   let insert_res = get_record(request.table,request.index)
    insert_res.then(res => {

        chrome.runtime.sendMessage({
            message: "get_success",
            payload: res,
            table: request.table
        })
    })

  }

  else if (request.message === 'update'){
   let update_res = update_record(request.payload[0],request.id,request.table)
    update_res.then(res => {
        chrome.runtime.sendMessage({
            message: "update_success",
            payload: res
        })
    })

  }
  else if (request.message === 'delete'){
   let delete_res = delete_record(request.id)
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
            payload: res[0],
            sec: res[1],
            type: request.type
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
            db.createObjectStore("record", { autoIncrement : true });
            db.createObjectStore("secret", { autoIncrement : true });

        }
        request.onsuccess = function (event) {
            db = event.target.result;
            console.log("DB OPENED.");
        }
    }





    function insert_records(table, records) {
        if (db) {
            const insert_transaction = db.transaction(table, "readwrite");
            const objectStore = insert_transaction.objectStore(table);
            return new Promise((resolve, reject) => {
                insert_transaction.oncomplete = function () {
                    // console.log("ALL INSERT TRANSACTIONS COMPLETE.");
                    resolve(true);
                }
                insert_transaction.onerror = function () {
                    // console.log("PROBLEM INSERTING RECORDS.")
                    resolve(false);
                }
                records.forEach(info => {
                    let request = objectStore.add(info);                
                    request.onsuccess = function (event) {
                        if(table == "record"){
                            info.id = event.target.result
                            console.log(info)
                            
                            update_record(info,event.target.result,table)
                        }
                    }
                    request.onerror = function () {
                        console.log("Fail add: ", info);
                    }
                });
            });
        }
    }


    function update_record(record,key,table) {
        if (db) {
            const put_transaction = db.transaction(table, "readwrite");
            const objectStore = put_transaction.objectStore(table);

            return new Promise((resolve, reject) => {
                put_transaction.oncomplete = function () {
                    // console.log("ALL PUT TRANSACTIONS COMPLETE.");
                    resolve(true);
                }

                put_transaction.onerror = function () {
                    // console.log("PROBLEM UPDATING RECORDS.")
                    resolve(false);
                }

                objectStore.put(record,parseInt(key));
            });
        }
    }



    function get_record(table, id) {
        if (db) {
            const get_transaction = db.transaction(table, "readonly");
            const objectStore = get_transaction.objectStore(table);

            return new Promise((resolve, reject) => {
                get_transaction.oncomplete = function () {
                    // console.log("ALL GET TRANSACTIONS COMPLETE.");
                }

                get_transaction.onerror = function () {
                    // console.log("PROBLEM GETTING RECORDS.")
                }

                let res = objectStore.get(id);

                res.onsuccess = function (event) {
                    resolve(event.target.result);
                }
            });
        }
    }




    function all_records() {
        if (db) {
            const put_transaction = db.transaction("record", "readonly");
            const objectStore = put_transaction.objectStore("record");

            const get_transaction2 = db.transaction("secret", "readonly");
            const objectStore2 = get_transaction2.objectStore("secret");
            return new Promise((resolve, reject) => {
                put_transaction.oncomplete = function () {
                    resolve(true);
                }
                put_transaction.onerror = function () {
                    resolve(false);
                }
                let res2 = objectStore2.get(1);
                var  sec =""
                res2.onsuccess = function (event) {
                    sec = event.target.result
                }

                let res = objectStore.getAll();

                // let re2 = objectStore.getAllKeys();

          

              
                res.onsuccess = function (event) {
                    resolve([event.target.result,sec]);
                }


            });
        }
    }


    function delete_record(id) {
        // alert(id)
        if (db) {
            const delete_transaction = db.transaction("record", 
            "readwrite");
            const objectStore = delete_transaction.objectStore("record");

            return new Promise((resolve, reject) => {
                delete_transaction.oncomplete = function () {
                    // console.log("ALL DELETE TRANSACTIONS COMPLETE.");
                    resolve(true);
                }

                delete_transaction.onerror = function () {
                    // console.log("PROBLEM DELETE RECORDS.")
                    resolve(false);
                }
           
                let res = objectStore.delete(parseInt(id));

                res.onsuccess = function (event) {
                //    alert("Deleted")
                }
            });
        }
    }

    create_database();
window.onload = function(e){ 

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.message === 'insert_success') {
			if(request.payload){
				document.querySelectorAll('.add_rec_input').forEach(e => e.value='')
			}
		}
		else if (request.message === 'get_success'){

			if (request.table == "record"){

			}else{
				if (request.payload == undefined){
					var secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
					chrome.runtime.sendMessage({
						message:'insert',
						payload:[secret],
						"table": "secret",
					})
				}
				updateSec(request.payload)

			}
		}
		else if (request.message === 'update_success'){
				// TBD
		}
		else if (request.message === 'delete_success'){
				// TBD
		}
		else if (request.message === 'getAll_success'){
			if(request.type == "table"){
					insertRecordToTable(request.payload)
			}else{
					download(request.payload)
			}
		}

	});


	var secret1 = ""
	function updateSec(secret){
		secret1 = secret
	}


	function insertRecordToTable(records){
			var table = document.getElementById("passwordTable")
			var rows = table.rows;
			var i = rows.length;
			while (--i) {
				table.deleteRow(i);
			}
			records.forEach(function(element) {
				var row = table.insertRow(-1);
				var res = decode([element.url,element.username,element.password])
				row.insertCell(0).innerHTML = res[0];
				row.insertCell(1).innerHTML = res[1];
				row.insertCell(2).innerHTML = res[2];
			});
	}




	
		function download(records){
			var csv = secret1+"\n"
			records.forEach(function(row) {
							csv += row.url+","+row.username+","+row.password;
							csv += "\n";
			});
			var hiddenElement = document.createElement('a');
			hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
			hiddenElement.target = '_blank';
			hiddenElement.download = 'passwordManager.csv';
			hiddenElement.click(); 		
	
		}





	function getSecret (){
			chrome.runtime.sendMessage({
				message:'get',
				payload:[{
					"table": "secret",
					"index": 1,
				}]
			})
	}


		getSecret()
		updateTable("table")
    document.getElementById("所有密码tab").onclick= function(){
			clear()
			document.getElementById("所有密码").style.display = "block";
		}
		document.getElementById("增加密码tab").onclick= function(){
			clear()
			document.getElementById("增加密码").style.display = "block";
		}
    // document.getElementById("自动生成tab").onclick= function(){
		// 	clear()
		// 	document.getElementById("自动生成").style.display = "block";
		// }
		// document.getElementById("安全笔记tab").onclick= function(){
		// 	clear()
		// 	document.getElementById("安全笔记").style.display = "block";
		// }
		document.getElementById("登录账号tab").onclick= function(){
			clear()
			document.getElementById("登录账号").style.display = "block";
		}


		//search
		function lookForUrl() {
			var input, filter, table, tr, td, i, txtValue;
			input = document.getElementById("searchInput");
			filter = input.value.toUpperCase();
			table = document.getElementById("passwordTable");
			tr = table.getElementsByTagName("tr");
			for (i = 0; i < tr.length; i++) {
				td = tr[i].getElementsByTagName("td")[0];
				if (td) {
					txtValue = td.textContent || td.innerText;
					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						tr[i].style.display = "";
					} else {
						tr[i].style.display = "none";
					}
				}       
			}
		}
		const searchInput = document.getElementById('searchInput');
		searchInput.addEventListener('keyup', lookForUrl);

		//download csv
    document.getElementById("download_csv").onclick= function(){
				chrome.runtime.sendMessage({
					message:'getAll',
					type: "download"
				})
		}




		//insert to database
		document.getElementById("add_form").addEventListener('submit', event => {
				event.preventDefault();
				const form_data1 = new FormData(document.getElementById("add_form"))
		
				const cryptores = encode([form_data1.get('url'),form_data1.get('username'),form_data1.get('password')])
				chrome.runtime.sendMessage({
					message:'insert',
					payload:[{
						"id":"",
						"url": String(cryptores[0]),
						"username": String(cryptores[1]),
						"password": String(cryptores[2])
					}],
					table:"record"
					
				})
				updateTable("table")
		}) 
		


		//get all records
		function updateTable(type){
				chrome.runtime.sendMessage({
					message:'getAll',
					type: type
				})
		}


		function encode(arr){
			var res = []
			arr.forEach(e => {
				res.push(CryptoJS.AES.encrypt(String(e), String(secret1)))
			})
			return res
		}


		function decode(arr){
			var res = []
			arr.forEach(e => {
				var decrypted = CryptoJS.AES.decrypt(e, secret1)
				res.push(decrypted.toString(CryptoJS.enc.Utf8))
			})
			return res
		}

		//import csv file
		function readSingleFile(evt) {
    var f = evt.target.files[0]; 
    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
					var count = 0
          var contents = e.target.result;
          var lines = contents.split("\n");
					var csvPayload = []
          for (var i=0; i<lines.length; i++){
							var aElement = lines[i].split(",")
							// var exp = ["", "url", "password","username"]
							// if(!exp.includes(aElement[0]) && !exp.includes(aElement[1]) &&  !exp.includes(aElement[2])){
								count = count + 1
								// var cryptores = encode([aElement[0],aElement[1],aElement[2]])
								csvPayload.push( {
								
									"id": "",
									"url": aElement[0],
									"username": aElement[1],
									"password": aElement[2]
								})
							// }
          }
					chrome.runtime.sendMessage({
						message:'insert',
						payload:csvPayload,
						table:"record"
					})
					alert(`上传成功,已导入${count}条记录。`);
					updateTable("table")
     }
      r.readAsText(f);
    } else { 
      alert("上传失败");
    }
  }
  document.getElementById('fileinput').addEventListener('change', readSingleFile);




	//clear tab
	function clear(){
		var i, tablinks, tabcontent;
		tabcontent = document.getElementsByClassName("tabcontent");
		for (i = 0; i < tabcontent.length; i++) {
			tabcontent[i].style.display = "none";
		}
		tablinks = document.getElementsByClassName("tablinks");
		for (i = 0; i < tablinks.length; i++) {
			tablinks[i].className = tablinks[i].className.replace(" active", "");
		}	
	}



	//password generator
	const keys = {
		upperCase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		lowerCase: "abcdefghijklmnopqrstuvwxyz",
		number: "0123456789",
		symbol: "!@#$%^&*()_+-=[]{}|"
	}
	const getKey = [
		function upperCase() {
			return keys.upperCase[Math.floor(Math.random() * keys.upperCase.length)];
		},
		function lowerCase() {
			return keys.lowerCase[Math.floor(Math.random() * keys.lowerCase.length)];
		},
		function number() {
			return keys.number[Math.floor(Math.random() * keys.number.length)];
		},
		function symbol() {
			return keys.symbol[Math.floor(Math.random() * keys.symbol.length)];
		}
	];

	document.getElementById("gen_button").onclick=function(){
		const passwordBox = document.getElementById("passwordBox");
		const length = document.getElementById("length");
		passwordBox.innerHTML = getRandomString(length);
	}

	function getRandomString(length){
		const upper = document.getElementById("upperCase").checked;
		const lower = document.getElementById("lowerCase").checked;
		const number = document.getElementById("number").checked;
		const symbol = document.getElementById("symbol").checked;
		if (upper + lower + number + symbol === 0) {
			alert("Please check atleast one box!");
			return;
		}
	
		let randomString = "";

		while (length > randomString.length) {
			let keyToAdd = getKey[Math.floor(Math.random() * getKey.length)];
			let isChecked = document.getElementById(keyToAdd.name).checked;
			if (isChecked) {
				randomString += keyToAdd();
			}
		}
		return randomString
	}

	document.getElementById("copyPassword").onclick=function(){
		const textarea = document.createElement("textarea");
		const password = document.getElementById("passwordBox").innerText;
		if (!password) { return; }
		textarea.value = password;
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand("copy");
		textarea.remove();
		alert("密码已复制");
	}




// 	alert()
// var encrypted = CryptoJS.AES.encrypt("Message", "U2FsdGVkX18ZUVvShFSES21qHsQEqZXMxQ9zgHy+bu0=");


// var decrypted = CryptoJS.AES.decrypt(encrypted, "U2FsdGVkX18ZUVvShFSES21qHsQEqZXMxQ9zgHy+bu0=");

// var encrypted = CryptoJS.AES.encrypt("Message", "U2FsdGVkX18ZUVvShFSES21qHsQEqZXMxQ9zgHy+bu0=");


// var decrypted = CryptoJS.AES.decrypt(encrypted, "U2FsdGVkX18ZUVvShFSES21qHsQEqZXMxQ9zgHy+bu0=");



// document.getElementById("demo1").innerHTML = encrypted;
// document.getElementById("demo2").innerHTML = decrypted;
// document.getElementById("demo3").innerHTML = decrypted.toString(CryptoJS.enc.Utf8);


	// // **********password**********
	// async function deriveKey(password) {
	// 	const algo = {
	// 		name: 'PBKDF2',
	// 		hash: 'SHA-256',
	// 		salt: new TextEncoder().encode('a-unique-salt'),
	// 		iterations: 1000
	// 	}
	// 	return crypto.subtle.deriveKey(
	// 		algo,
	// 		await crypto.subtle.importKey(
	// 			'raw',
	// 			new TextEncoder().encode(password),
	// 			{
	// 				name: algo.name
	// 			},
	// 			false,
	// 			['deriveKey']
	// 		),
	// 		{
	// 			name: 'AES-GCM',
	// 			length: 256
	// 		},
	// 		false,
	// 		['encrypt', 'decrypt']
	// 	)
	// }

	// // Encrypt function
	// async function encrypt(text, password) {
	// 	const algo = {
	// 		name: 'AES-GCM',
	// 		length: 256,
	// 		iv: crypto.getRandomValues(new Uint8Array(12))
	// 	}
	// 	return {
	// 		cipherText: await crypto.subtle.encrypt(
	// 			algo,
	// 			await deriveKey(password),
	// 			new TextEncoder().encode(text)
	// 		),
	// 		iv: algo.iv
	// 	}
	// }

	// // Decrypt function
	// async function decrypt(encrypted, password) {
	// 	const algo = {
	// 		name: 'AES-GCM',
	// 		length: 256,
	// 		iv: encrypted.iv
	// 	}
	// 	return new TextDecoder().decode(
	// 		await crypto.subtle.decrypt(
	// 			algo,
	// 			await deriveKey(password),
	// 			encrypted.cipherText
	// 		)
	// 	)
	// }

	

	// ;(async () => {

	// 	const encrypted = await encrypt('Secret text', secret)
	// 	// alert(encrypted)

	// 	// decrypt it
	// 	const decrypted = await decrypt(encrypted, secret)
	// 	// alert(decrypted) // Secret text
	// })()


// 	// **********password**********
// 	async function deriveKey(password) {
// 		const algo = {
// 			name: 'PBKDF2',
// 			hash: 'SHA-256',
// 			salt: new TextEncoder().encode('a-unique-salt'),
// 			iterations: 1000
// 		}
// 		return crypto.subtle.deriveKey(
// 			algo,
// 			await crypto.subtle.importKey(
// 				'raw',
// 				new TextEncoder().encode(password),
// 				{
// 					name: algo.name
// 				},
// 				false,
// 				['deriveKey']
// 			),
// 			{
// 				name: 'AES-GCM',
// 				length: 256
// 			},
// 			false,
// 			['encrypt', 'decrypt']
// 		)
// 	}

// 	// Encrypt function
// 	async function encrypt(text, password) {
// 		const algo = {
// 			name: 'AES-GCM',
// 			length: 256,
// 			iv: crypto.getRandomValues(new Uint8Array(12))
// 		}
// 		return {
// 			cipherText: await crypto.subtle.encrypt(
// 				algo,
// 				await deriveKey(password),
// 				new TextEncoder().encode(text)
// 			),
// 			iv: algo.iv
// 		}
// 	}

// 	// Decrypt function
// 	async function decrypt(encrypted, password) {
// 		const algo = {
// 			name: 'AES-GCM',
// 			length: 256,
// 			iv: encrypted.iv
// 		}
// 		return new TextDecoder().decode(
// 			await crypto.subtle.decrypt(
// 				algo,
// 				await deriveKey(password),
// 				encrypted.cipherText
// 			)
// 		)
// 	}

// 	secret = getRandomString(12)
// 	alert("test!!!!!!!!!")
// 	alert(secret)
// 	;(async () => {
// 		// encrypt
// 		const encrypted = await encrypt('Secret text', secret)
// 		alert(encrypted)

// 		// decrypt it
// 		const decrypted = await decrypt(encrypted, secret)
// 		alert(decrypted) // Secret text
// 	})()


}





//baidu
// https://openapi.baidu.com/oauth/2.0/
//login_success#expires_in=2592000&
//access_token=123.d9f2c2204be8065f434b7154bdd46a80.Ynd-sgd2Y2OIJdVcsEyl76VnM4Nxq99CeM1Yxje.cOhNIw
//&session_secret=&session_key=&scope=basic+netdisk


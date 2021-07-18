window.onload = function(e){ 


// ******************** Secret ********************
	var secret1 = ""
	function getSecret (){
			chrome.runtime.sendMessage({
				message:'get',
				table:"secret",
				index: 1
			})
	}

	function updateSec(sec){
		secret1 = sec

	}

	getSecret()



chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
		if (request.message === 'insert_success' && request.payload) {
				document.querySelectorAll('.add_rec_input').forEach(e => e.value='')
				updateTable("table")
		}

		else if (request.message === 'get_success'){
			if (request.table == "secret" && request.payload == undefined){
					var secret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
					chrome.runtime.sendMessage({
						message:'insert',
						payload:[secret],
						"table": "secret",
					})
			}
			updateSec(request.payload )
			updateTable("table")
		}

		else if (request.message === 'update_success'){
			updateTable("table")
		}
		else if (request.message === 'delete_success'){
			updateTable("table")
		}
		else if (request.message === 'getAll_success'){
			if(request.type == "table"){	
					secret1 = request.sec
					insertRecordToTable(request.payload,request.sec)
			}else{
					download(request.payload,request.sec)
			}
		}
		
	});



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


	




	// ******************** table ********************
		function insertRecordToTable(records,sec){
				var index, table = document.getElementById("passwordTable")
				var rows = table.rows;
				var i = rows.length;
				while (--i) {
					table.deleteRow(i);
				}

				records.forEach(function(element) {
					var row = table.insertRow(-1);
					var res = decode([element.url,element.username,element.password])
					row.insertCell(0).innerHTML = `<a	contenteditable="false">${res[0]}</a>`;
					row.insertCell(1).innerHTML = `<a	contenteditable="false">${res[1]}</a>`;
					row.insertCell(2).innerHTML = `<a	contenteditable="false">${res[2]}</a>`;
					row.insertCell(3).innerHTML = `<button id="edit">编辑</button>`;
					row.insertCell(4).innerHTML = `<button id="delete">删除</button>`
					row.insertCell(5).innerHTML = `<a style="display: none;">${element.id}</a>`;
				});


			//delete button
			for(var i = 1; i < table.rows.length; i++)
			{
					table.rows[i].cells[4].onclick = function()
					{
							index = this.parentElement.rowIndex;
							var cell5 = table.rows[index].cells[5].innerHTML
							chrome.runtime.sendMessage({
								message: 'delete',
								"id": cell5.match(/>(.*?)</i)[1]
							})
							table.deleteRow(index);
					};
			}
			//update button
			for(var i = 1; i < table.rows.length; i++)
			{
					table.rows[i].cells[3].onclick = function()
					{
						var index = this.parentElement.rowIndex;
						var oneRow = table.rows[index]
						var cell0 = oneRow.cells[0]
						var cell1 = oneRow.cells[1]
						var cell2 = oneRow.cells[2]
						var cell3 = oneRow.cells[3]
						var cell5 = oneRow.cells[5]
						var button = cell3.innerText
						if(button == "编辑" ){
							cell0.innerHTML = cell0.innerHTML.replace("false", "true")
							cell1.innerHTML = cell1.innerHTML.replace("false", "true")
							cell2.innerHTML = cell2.innerHTML.replace("false", "true")
							cell3.innerHTML = cell3.innerHTML.replace("编辑", "保存")
						}else{
							var id = cell5.innerHTML.match(/>(.*?)</i)[1]
							cell0.innerHTML = cell0.innerHTML.replace("true", "false")
							cell1.innerHTML = cell1.innerHTML.replace("true", "false")
							cell2.innerHTML = cell2.innerHTML.replace("true", "false")
							cell3.innerHTML = cell3.innerHTML.replace("保存", "编辑")
							const cryptores = encode([cell0.innerText,cell1.innerText,cell2.innerText])
							chrome.runtime.sendMessage({
								message:'update',
								payload:[{
									"id":parseInt(id),
									"url": String(cryptores[0]),
									"username": String(cryptores[1]),
									"password": String(cryptores[2])
								}],
								id:id,
								table: "record"
							})
							updateTable("table")
						}
					}
			}
	}


	function updateTable(type){
			chrome.runtime.sendMessage({
				message:'getAll',
				type: type
			})
	}









	// ******************** download ********************
		function download(records,sec){
			var csv = "1"+","+sec+"\n"
			records.forEach(function(row) {
							csv += row.id+","+row.url+","+row.username+","+row.password;
							csv += "\n";
			});
			var hiddenElement = document.createElement('a');
			hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
			hiddenElement.target = '_blank';
			hiddenElement.download = 'passwordManager.csv';
			hiddenElement.click(); 		
	
		}

    document.getElementById("download_csv").onclick= function(){
				chrome.runtime.sendMessage({
					message:'getAll',
					type: "download"
				})
		}







  
	// ******************** search box ********************
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





		// ******************** insert a record ********************
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
		




		// ******************** import csv file ********************
		function readSingleFile(evt) {
    var f = evt.target.files[0]; 
    if (f) {
      var r = new FileReader();
      r.onload = function(e) { 
					var count = 0
          var contents = e.target.result;
          var lines = contents.split("\n");
					var csvPayload = []

					
					var sec = lines[0].split(",")	
					chrome.runtime.sendMessage({
							message:'update',
							payload:[sec[1]],
							id:1,
							table: "secret"
						})

          for (var i=1; i<lines.length-1; i++){
				
							var aElement = lines[i].split(",")	
							// if(aElement[1] == "" && aElement[2]==""&& aElement[3]==""){
									count = count + 1
									csvPayload.push( {
										"id": "",
										"url": aElement[1],
										"username": aElement[2],
										"password": aElement[3]
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
					document.getElementById("fileinput").value = null;
					
     }
      r.readAsText(f);
    } else { 
      alert("上传失败");
    }
  }
  document.getElementById('fileinput').addEventListener('change', readSingleFile);



	// ******************** clear tab ********************
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


	// ******************** password generator ********************
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



		function encode(arr){
			// alert("encode"+secret1)
			var res = []
			arr.forEach(e => {
				res.push(CryptoJS.AES.encrypt(String(e), String(secret1)))
			})
			return res
		}


		function decode(arr){
			// alert("decode   :"+secret1)
			var res = []
			arr.forEach(e => {
				var decrypted = CryptoJS.AES.decrypt(String(e), String(secret1))
				res.push(decrypted.toString(CryptoJS.enc.Utf8))
			})
			return res
		}




		// getSecret()
		// updateTable("table")
	
}





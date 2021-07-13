chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.message === 'insert_success') {
		if(request.payload){
			document.querySelectorAll('.add_rec_input').forEach(e => e.value='')
		}
  }
  else if (request.message === 'get_success'){
			// TBD
  }
  else if (request.message === 'update_success'){
			// TBD
  }
  else if (request.message === 'delete_success'){
  		// TBD
  }
	else if (request.message === 'getAll_success'){
		var table = document.getElementById("passwordTable")
		var rows = table.rows;
		var i = rows.length;
		while (--i) {
			table.deleteRow(i);
		}
		request.payload.forEach(function(element) {
			var row = table.insertRow(-1);
			row.insertCell(0).innerHTML = element.url;
			row.insertCell(1).innerHTML = element.username;
			row.insertCell(2).innerHTML = element.password;
		});
	}

});


window.onload = function(e){ 

		updateTable()
    document.getElementById("所有密码tab").onclick= function(){
			clear()
			document.getElementById("所有密码").style.display = "block";
		}
		document.getElementById("增加密码tab").onclick= function(){
			clear()
			document.getElementById("增加密码").style.display = "block";
		}
    document.getElementById("自动生成tab").onclick= function(){
			clear()
			document.getElementById("自动生成").style.display = "block";
		}
		document.getElementById("安全笔记tab").onclick= function(){
			clear()
			document.getElementById("安全笔记").style.display = "block";
		}
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



		//insert to database
		document.getElementById("add_form").addEventListener('submit', event => {
				event.preventDefault();
				const form_data1 = new FormData(document.getElementById("add_form"))
				chrome.runtime.sendMessage({
					message:'insert',
					payload:[{
						"url": form_data1.get('url'),
						"username": form_data1.get('username'),
						"password": form_data1.get('password')
					}]
				})
				updateTable()
		}) 
		


		//get all records
		function updateTable(){
				chrome.runtime.sendMessage({
					message:'getAll',
				})
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
							var exp = ["", "url", "password","username"]
							if(!exp.includes(aElement[0]) && !exp.includes(aElement[1]) &&  !exp.includes(aElement[2])){
								count = count + 1
								var feed = {
									"url": aElement[0],
									"username": aElement[1],
									"password": aElement[2]
								}
								csvPayload.push(feed)
							}
          }
					chrome.runtime.sendMessage({
						message:'insert',
						payload:csvPayload
					})
					alert(`上传成功,已导入${count}条记录。`);
					updateTable()
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
		const upper = document.getElementById("upperCase").checked;
		const lower = document.getElementById("lowerCase").checked;
		const number = document.getElementById("number").checked;
		const symbol = document.getElementById("symbol").checked;
		if (upper + lower + number + symbol === 0) {
			alert("Please check atleast one box!");
			return;
		}
		const passwordBox = document.getElementById("passwordBox");
		const length = document.getElementById("length");
		let password = "";
		while (length.value > password.length) {
			let keyToAdd = getKey[Math.floor(Math.random() * getKey.length)];
			let isChecked = document.getElementById(keyToAdd.name).checked;
			if (isChecked) {
				password += keyToAdd();
			}
		}
		passwordBox.innerHTML = password;
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





}





//baidu
// https://openapi.baidu.com/oauth/2.0/
//login_success#expires_in=2592000&
//access_token=123.d9f2c2204be8065f434b7154bdd46a80.Ynd-sgd2Y2OIJdVcsEyl76VnM4Nxq99CeM1Yxje.cOhNIw
//&session_secret=&session_key=&scope=basic+netdisk


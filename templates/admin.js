var patientTable = document.getElementById("patientTable");
var row = patientTable.insertRow(1);
row.insertCell(0).innerHTML = "ABC";
row.insertCell(1).innerHTML = "DEF";
fetch('/admin_get_data', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
	  		alert("Get Data fail");
            return;
        }

        response.json().then(function (data) {
		     for(i in data.patient)
		     {
		     	row=patientTable.insertRow(1);
		     	row.insertCell(0).innerHTML = data.patient[i].patient_id;
		     	row.insertCell(1).innerHTML = data.patient[i].name;
		     }
        });
    })
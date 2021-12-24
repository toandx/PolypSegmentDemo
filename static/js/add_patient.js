document.getElementById("submit_infor_btn").addEventListener("click", function() {
	id=document.getElementById("patient_id").value;
	name=document.getElementById("patient_name").value;
	age=document.getElementById("patient_age").value;
  sex=$( "#sex option:selected" ).val();
	address=document.getElementById("patient_address").value;
	tien_su_benh_an=document.getElementById("tien_su_benh_an").value;

	fetch('/patient/add', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'id':id,'name':name,'age':age,'sex':sex,'address':address,'tien_su_benh_an':tien_su_benh_an}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
          alert("Kết nối không thành công")
            return;
        }

        response.json().then(function (data) {
		      if (data=='1') alert('Thêm bệnh nhân mới thành công'); else
          alert("Mã bệnh nhân đã tồn tại trong hệ thống");
        });
    })
	
});
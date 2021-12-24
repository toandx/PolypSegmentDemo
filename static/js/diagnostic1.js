$("#update_patient_infor_btn").click(function(){
  fetch('/patient/update', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'id':patient_id,'name':$('#patient_name').val(),'age':$('#patient_age').val(),
        	'sex':$( "#sex option:selected" ).val(),'address':$('#patient_address').val(),'tien_su_benh_an':$('#tien_su_benh_an').val()}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
            if (data=='1')
            {
            	alert('Cập nhật thông tin thành công!');
            } else
            {
            	alert("Không tìm thấy bệnh nhân");
            }
        });
    })
});
$("#delete_session_btn").click(function(){
  fetch('/patient_session/delete', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'session_id':session_id_temp}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
            if (data=='1')
            {
                alert('Xóa ca bệnh thành công');
                $(".video-block").hide();
                $(".image-block").hide();
                update_patient_infor();
            } else
            {
                alert("Không tìm thấy ca bệnh");
            }
        });
    })
});
$("#capture_frame_link").click(function(e) {
    e.preventDefault();  //stop the browser from following
    window.location.href = '/get_frame?path='+output_path_temp+'&id='+currentFrame;
});
$("#export_profile_link").click(function(e) {
    e.preventDefault();  //stop the browser from following
    if (patient_id!='')
        window.location.href = '/export_patient_profile/'+patient_id; 
    else
        alert("Không tìm thấy bệnh nhân");
});
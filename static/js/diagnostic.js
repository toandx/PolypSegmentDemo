$(function() {
  $('#datetimepicker1').datetimepicker({
    format : 'DD/MM/YYYY HH:mm'
  });  
});
var list_session_id=[];
var list_session_time=[];
var list_diagnostic=[];
var session_id_temp=-1;
var input_path_temp='';
var output_path_temp='';
var data_type_temp='';
var histogram_temp=[];
var session_mode='';
function update_session_infor(session_id)
{
  fetch('/patient_session/search', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'session_id':session_id}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
          if (data.creator_id==-1)
          {
            alert("Không tìm thấy ca bệnh!");
          } else 
          {
            creator_id=data.creator_id;
            input_path_temp=data.input_path;
            output_path_temp=data.output_path;
            data_type_temp=data.data_type;
            histogram_temp=data.histogram;
            $("#session_time").val(data.time);
            $("#creator_name").val(data.creator_name);
            $("#dau_hieu_lam_sang").val(data.dau_hieu_lam_sang);
            $("#chuan_doan").val(data.diagnostic);
            $("#huong_dieu_tri").val(data.huong_dieu_tri);
            $("#download_resource_link").attr("href",'/download/'+output_path_temp);
            if (data_type_temp=='video')
            {
              $(".video-block").show();
              $(".image-block").hide();
              video_player.src=output_path_temp;
              update_video_and_chart();
            } else
            {
              $(".video-block").hide();
              $(".image-block").show();
              $("#image_inp").attr("src",input_path_temp);
              $("#image_out").attr("src",output_path_temp);
            }
            if (user_id==creator_id)
            {
              $("#submit_infor_session_btn").html("Cập nhật");
              session_mode='edit';
            } else
            {
              session_mode='';
            }
          }      
        });
    })
}
function summary_string(str,max_length)
{
  if (str.length<=max_length)
    return(str);
  return(str.substr(0,max_length-3)+'...');
}
function update_patient_infor()
{
  list_session_id=[];
  id=document.getElementById("patient_id").value;
  fetch('/patient/search', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'id':id}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
            if (data.patient_name!="")
            {
              patient_id=id;
              list_session_id=data.session_id;
              list_session_time=data.session_time;
              list_diagnostic=data.diagnostic;
              document.getElementById("infor_block").style.display="block";
              $(".list-group-item").remove();
              for(i in list_session_id)
              {
                var item = $("<li class='list-group-item'></li>");
                item.attr('session_id',list_session_id[i]);
                item.append($("<p class='my-0'></p>").text('Thời gian: '+list_session_time[i]));
                item.append($("<p class='my-0'></p>").text('Chuẩn đoán: '+summary_string(list_diagnostic[i].toString(),20)));
                $("#list_session").append(item);
              }
              $(".list-group-item").click(function(){
                $('.list-group-item.active').removeClass("active");
                $(this).addClass("active");
                session_id_temp=$(this).attr('session_id');
                update_session_infor(session_id_temp);
              });
              $("#patient_name").val(data.patient_name);
              $("#patient_age").val(data.patient_age);
              $("#patient_address").val(data.patient_address);
              $("#tien_su_benh_an").val(data.tien_su_benh_an);
              $("#sex").val(data.patient_sex);

            } else
            {
              document.getElementById("infor_block").style.display="none";
              alert("Không tìm thấy bệnh nhân");
            }
        });
    })
}
$("#search_btn").click(function(){
  update_patient_infor();
});
document.getElementById("upload_data_form").addEventListener('submit', e => {
  e.preventDefault();
  var input = document.querySelector('input[type="file"]');
  document.getElementById("loader").style.display="inline-block";
  var formData = new FormData();
  formData.append('file', input.files[0]);
  fetch('/upload/data', {
        method: 'POST',
    body: formData,
  }).then(response => {
  if (response.status !== 200) {
            return;
            alert("Lỗi kết nối");
        }
        response.json().then(function (data) {
        document.getElementById("loader").style.display="none";
        if (data.data_type=='none')
        {
          alert('Định dạng dữ liệu không phù hợp!');
        } else
        {
          $("#creator_name").val(user_name);
          $("#dau_hieu_lam_sang").val('');
          $("#chuan_doan").val('');
          $("#huong_dieu_tri").val('');
          $("#session_time").val('');
          input_path_temp=data.input_path;
          output_path_temp=data.output_path;
          histogram_temp=data.his;
          data_type_temp=data.data_type;
          $("#download_resource_link").attr("href",'/download/'+output_path_temp);
          $("#submit_infor_session_btn").html("Thêm ca bệnh");
          if (data_type_temp=='video')
          {
            $(".video-block").show();
            $(".image-block").hide();
            video_player.src=output_path_temp;
            session_mode='add';
            update_video_and_chart();
          } else
          {
            $(".video-block").hide();
            $(".image-block").show();
            $("#image_inp").attr("src",input_path_temp);
            $("#image_out").attr("src",output_path_temp);
            session_mode='add';
          }
        }
  });
    });
});

$("#submit_infor_session_btn").click(function(){
  if (session_mode=='add')
  {
    fetch('/patient_session/add', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'creator_id':user_id, 'patient_id':patient_id, 'input_path':input_path_temp, 'output_path':output_path_temp, 
          'histogram':histogram_temp,'data_type':data_type_temp,'time':$("#session_time").val(), 
          'dau_hieu_lam_sang':$("#dau_hieu_lam_sang").val(),
          'diagnostic':$("#chuan_doan").val(), 'huong_dieu_tri':$("#huong_dieu_tri").val()}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
          alert('Lỗi kết nối!');
            return;
        }

        response.json().then(function (data) {
            if (data=='1')
              {
                alert('Thêm ca bệnh thành công ');
                update_patient_infor();
                session_mode='';
              }
        });
    });

  } else
  if (session_mode=='edit')
  {
    fetch('/patient_session/update', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'session_id':session_id_temp,'time':$("#session_time").val(), 
          'dau_hieu_lam_sang':$("#dau_hieu_lam_sang").val(),
          'diagnostic':$("#chuan_doan").val(), 'huong_dieu_tri':$("#huong_dieu_tri").val()}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
          alert('Lỗi kết nối!');
            return;
        }

        response.json().then(function (data) {
            if (data=='1')
              {
                alert('Cập nhật thông tin ca bệnh thành công! ');
                update_patient_infor();
                //session_mode='';
              }
        });
    });

  };
});

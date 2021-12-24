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
$("#submit_infor_session_btn").hide();
$("#download_resource_link").hide();
function update_session_infor(session_id)
{
  fetch('/patient_session/search', {
        method: 'POST',
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
            $("#download_resource_link").show();
            $("#download_resource_link").attr("href",'/download/'+output_path_temp);
            if (data_type_temp=='video')
            {
              $(".video-block").show();
              $(".image-block").hide();
              video_player.src=output_path_temp;
              update_video_and_chart();
              $("#capture_frame_link").show();
            } else
            {
              $(".video-block").hide();
              $(".image-block").show();
              $("#capture_frame_link").hide();
              $("#image_inp").attr("src",input_path_temp);
              $("#image_out").attr("src",output_path_temp);
            }
            if (user_id==creator_id)
            {
              $("#submit_infor_session_btn").show();
              $("#delete_session_btn").show();
              $("#submit_infor_session_btn").html("Cập nhật");
              session_mode='edit';
            } else
            {
              $("#submit_infor_session_btn").hide();
              $("#delete_session_btn").hide();
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
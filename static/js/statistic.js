function delete_patient(patient_id)
{
    fetch('/patient/delete', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'patient_id':patient_id}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
            if (data=='1')
            {
                alert('Xóa bệnh nhân thành công!');
                update_list_patient();
            } else
            {
                alert("Có lỗi xảy ra!");
            }
        });
    });
}
function delete_session(session_id)
{
    fetch('/patient_session/delete', {
        method: 'DELETE',
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
            if (data=='1')
            {
                alert('Xóa ca bệnh thành công!');
                update_list_session();
            } else
            {
                alert("Có lỗi xảy ra!");
            }
        });
    });
}
function update_list_patient()
{
    fetch('/statistic/patient', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
            patient_id=data.patient_id;
            patient_name=data.patient_name;
            patient_age=data.patient_age;
            patient_sex=data.patient_sex;
            patient_address=data.patient_address;
            tien_su_benh_an=data.tien_su_benh_an;
            $("#patient_table").find("tr:gt(0)").remove();
            for(i in patient_id)
            {
                table_row=$("<tr></tr>");
                table_row.append('<td>'+patient_id[i]+'</td>');
                table_row.append('<td>'+patient_name[i]+'</td>');
                table_row.append('<td>'+patient_age[i]+'</td>');
                if (patient_sex[i]=='male')
                table_row.append('<td>'+'Nam'+'</td>'); else
                table_row.append('<td>'+'Nữ'+'</td>'); 
                table_row.append('<td>'+patient_address[i]+'</td>');
                table_row.append('<td>'+tien_su_benh_an[i]+'</td>');
                var button = $('<button class="btn btn-danger patient-btn"></button>').html("Xóa");
                button.attr('index',i);
                table_row.append($('<td></td>').html(button));
                $('#patient_table > tbody:last').append(table_row);
            }
            $("button.patient-btn").click(function(){
                id=$(this).attr('index');
                delete_patient(patient_id[id]);
            });
        });
    })
}
function update_list_session()
{
    fetch('/statistic/session', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
            session_id=data.session_id;
            patient_id=data.patient_id;
            creator_id=data.creator_id;
            time=data.time;
            dau_hieu_lam_sang=data.dau_hieu_lam_sang;
            diagnostic=data.diagnostic;
            huong_dieu_tri=data.huong_dieu_tri;
            $("#session_table").find("tr:gt(0)").remove();
            for(i in session_id)
            {
                table_row=$("<tr></tr>");
                table_row.append('<td>'+session_id[i]+'</td>');
                table_row.append('<td>'+patient_id[i]+'</td>');
                table_row.append('<td>'+creator_id[i]+'</td>');
                table_row.append('<td>'+time[i]+'</td>');
                table_row.append('<td>'+dau_hieu_lam_sang[i]+'</td>');
                table_row.append('<td>'+diagnostic[i]+'</td>');
                table_row.append('<td>'+huong_dieu_tri[i]+'</td>');
                var button = $('<button class="btn btn-danger session-btn"></button>').html("Xóa");
                button.attr('index',i);
                table_row.append($('<td></td>').html(button));
                $('#session_table > tbody:last').append(table_row);
            }
            $("button.session-btn").click(function(){
                id=$(this).attr('index');
                delete_session(session_id[id]);
            });
        });
    })
}
$("#patient_table").show();
$("#session_table").hide();
update_list_patient();
$("#subject").change(function(){
    value=$( "#subject option:selected" ).val();
    if (value=='patient')
    {
        $("#patient_table").show();
        $("#session_table").hide();
        update_list_patient();
    } else
    {
        $("#patient_table").hide();
        $("#session_table").show();
        update_list_session();
    }
});

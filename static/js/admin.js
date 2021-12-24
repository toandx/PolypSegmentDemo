function delete_user(user_id)
{
    fetch('/user/delete', {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'user_id':user_id}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
            if (data=='1')
            {
                alert('Xóa tài khoản thành công');
            } else
            {
                alert("Không tìm thấy tài khoản");
            }
        });
    });
}
function update_user_status(user_id,status)
{
    fetch('/user/status', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'user_id':user_id,'status':status}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
            return;
        }

        response.json().then(function (data) {
            window.location.href = "/admin";
        });
    });
}
function update_list_user()
{
    fetch('/statistic/user', {
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
            list_user_id=data.user_id;
            list_user_name=data.user_name;
            list_user_email=data.user_email;
            list_user_hospital=data.user_hospital;
            list_user_division=data.user_division;
            list_user_status=data.user_status;
            for(i in list_user_id)
            {
                table_row=$("<tr></tr>");
                table_row.append('<td>'+list_user_id[i]+'</td>');
                table_row.append('<td>'+list_user_name[i]+'</td>');
                table_row.append('<td>'+list_user_email[i]+'</td>');
                table_row.append('<td>'+list_user_hospital[i]+'</td>');
                table_row.append('<td>'+list_user_division[i]+'</td>');
                var button = $('<button class="btn status-btn"></button>');
                button.attr('index',i);
                if (list_user_status[i]=='true')
                {
                    button.addClass("btn-success");
                    button.html("Kích hoạt");
                } else
                {
                    button.addClass("btn-secondary");
                    button.html("Vô hiệu hóa");
                }
                var cell=$('<td></td>').html(button);
                table_row.append(cell);
                button = $('<button class="btn btn-danger delete-btn"></button>').html("Xóa");
                button.attr('index',i);
                cell=$('<td></td>').html(button);
                table_row.append(cell);
                $('#user_table > tbody:first').append(table_row);
            }
            $("button.status-btn").click(function(){
                id=$(this).attr('index');
                if (list_user_status[id]=='true')
                update_user_status(list_user_id[id],false); else
            	update_user_status(list_user_id[id],true);
            });
            $("button.delete-btn").click(function(){
                id=$(this).attr('index');
                delete_user(list_user_id[id]);
                window.location.href = "/admin";
            });
        });
    })
}
update_list_user();
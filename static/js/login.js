var user_id=-1;
var user_name='';
function update_user_infor()
{
    fetch('/user/get_infor', {
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
            user_id=data.user_id;
            user_name=data.user_name;
            if (user_id!=-1)
            {
                document.getElementById("hello_txt").innerHTML="Xin chào "+user_name;
                document.getElementById("log_out_link").style.display="block";
                document.getElementById("log_in_link").style.display="none";
                if (user_name=='admin')
                    document.getElementById('admin_tab').style.display="block";
            }
            else
            {
                document.getElementById("hello_txt").innerHTML="";
                document.getElementById("log_out_link").style.display="none";
                document.getElementById("log_in_link").style.display="block";
            }
        });
    })
}
document.getElementById("form-signin").addEventListener('submit', e => {
        e.preventDefault();
        email=document.getElementById("inputEmail").value;
        pass=document.getElementById("inputPassword").value;
        fetch('/user/login', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'email':email,'pw':pass}),
        }).then(response => {
        if (response.status !== 200) {
            console.log(`Looks like there was a problem. Status code: ${response.status}`);
            alert("Login fail");
            return;
        }
        response.json().then(function (data) {
            if (data.user_id==-1)
            {
                document.getElementById("error_txt").style.display="block";
                $("#error_txt").html("Email hoặc mật khẩu không đúng");
                user_id=-1;
                user_name='';
            } else
            if (data.user_id==-2)
            {
                document.getElementById("error_txt").style.display="block";
                $("#error_txt").html("Tài khoản của bạn đã bị vô hiệu hóa!");
                user_id=-1;
                user_name='';
            }
            else
            {
                user_id=data.user_id;
                user_name=data.user_name;
                if (user_name=='admin')
                    document.getElementById('admin_tab').style.display="block";
                document.getElementById("log_out_link").style.display="block";
                document.getElementById("log_in_link").style.display="none";
                document.getElementById("error_txt").style.display="none";
                document.getElementById("hello_txt").innerHTML="Xin chào "+data.user_name;
                $('#logInModal').modal('hide')
                alert("Login successful");
            }
        });
    })
});
document.getElementById("log_out_link").addEventListener("click", function() {
    document.getElementById("hello_txt").innerHTML="";
    document.getElementById("log_out_link").style.display="none";
    document.getElementById("log_in_link").style.display="block";
    user_id=-1;
    user_name='';
    fetch('/user/logout', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
    })
    document.getElementById('admin_tab').style.display="none";
});
update_user_infor();
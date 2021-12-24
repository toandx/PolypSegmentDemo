document.getElementById("register_form").addEventListener('submit', e => {
        e.preventDefault();
        email=document.getElementById("email").value;
        old_pass=document.getElementById("old_password").value;
        new_pass=document.getElementById("new_password").value;
        confirm_pass=document.getElementById("confirm_pw").value;
        if (confirm_pass==new_pass)
        {
	fetch('/user/change_pw', {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'email':email,'old_pass':old_pass,'new_pass':new_pass}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
	       alert("Connect to server f");
            return;
        }

        response.json().then(function (data) {
            if (data=='0') alert('Tên tài khoản hoặc mật khẩu sai!'); else
            alert("Đổi mật khẩu thành công!");
            window.location.href = "/home";
        });
    })} else alert("Mật khẩu không trùng khớp");
	
});

document.getElementById("register_form").addEventListener('submit', e => {
        e.preventDefault();
        name=$("#name").val();
        email=$("#email").val();
        pass=$("#password").val();
        hospital=$("#hospital").val();
        division=$("#division").val();
	fetch('/user/add', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'name':name,'email':email,'pass':pass,'hospital':hospital,'division':division}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
	  alert("Create user fail");
            return;
        }

        response.json().then(function (data) {
            if (data=='0')
                alert('Email đã được sử dụng cho một tài khoản khác!'); else
            {
                alert("Tạo tài khoản thành công!");
                window.location.href = "/home";
            }
        });
    })
	
});

const form = document.querySelector('form');
const url_uploader = '/upload/image';
form.addEventListener('submit', e => {
	e.preventDefault();
	document.getElementById("loader").style.display="inline-block";
	var input = document.querySelector('input[type="file"]');
	var formData = new FormData();
	formData.append('file', input.files[0]);
	fetch(url_uploader, {
        method: 'POST',
		body: formData,
    }).then(response => {
        if (response.status !== 200) {
            return;
        }

        response.json().then(function (data) {
            console.log(data);
	    //setTimeout(function(){}, 3000);
//	    document.getElementById("submit_btn").innerHTML='Submit':
	    document.getElementById("loader").style.display="none";
          document.getElementById("image_inp").src = data.image_inp;
          document.getElementById("image_out").src = data.image_out;
        });
    });
});

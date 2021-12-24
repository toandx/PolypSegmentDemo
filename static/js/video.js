const form = document.querySelector('form');
video_player=document.getElementById("video_player")
var x,y,duration,time,currentFrame,his_length,id,name,des,frame_time,frame_time_plus;
currentFrame=0;
var ctx = document.getElementById('myChart').getContext('2d');
var chartData={
        labels: [],
        datasets: [{
            label: 'Patient',
            borderColor: 'green',
            backgroundColor: function(context) {
    var index = context.dataIndex;
    return (index == currentFrame) ? 'red':'green';
  },
            pointRadius: function(context) {
    var index = context.dataIndex;
    return (index == currentFrame) ? 5:3;
  },
            data: [],
            fill:false,
        }]
    };
var options = {
  title: {
    display:true,
    text: 'Likelihood of Polyp',
  },
  legend: {
        display: false
  },
  onClick: (evt, item) => {
    var activePoints = chart.getElementsAtEvent(evt);
    if(activePoints.length > 0)
    {
	currentFrame = activePoints[0]["_index"];
	time=(duration/his_length*currentFrame);
	alert(currentFrame+' '+time);
	//time=(duration/his_length*(currentFrame+1));
	video_player.currentTime=time;
	video_player.pause();
   }
   window.chart.update();
  },
}

window.chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: chartData,

    // Configuration options go here
    options: options,
});
form.addEventListener('submit', e => {
	e.preventDefault();
	var input = document.querySelector('input[type="file"]');
	document.getElementById("loader").style.display="inline-block";
	var formData = new FormData();
	formData.append('file', input.files[0]);
	fetch('/upload/video', {
        method: 'POST',
		body: formData,
	}).then(response => {
	if (response.status !== 200) {
            return;
        }

        response.json().then(function (data) {
		document.getElementById("loader").style.display="none";
		his=data.his;
		x=[];
		y=[];
		for(i in his) {x[i]=parseInt(i,10)+1;y[i]=his[i];}
		chartData.labels=x;
		chartData.datasets[0].data=y;
		his_length=his.length;
		video_player.src = data.video_path;
		video_player.onloadedmetadata = function() {duration=video_player.duration;};
		window.chart.update();
	});
    });
});
document.getElementById("submit_infor_btn").addEventListener("click", function() {
	id=document.getElementById("patient_id").value;
	name=document.getElementById("patient_name").value;
	des=document.getElementById("description").value;
	fetch('upload/patient', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({'id':id,'name':name,'des':des}),
    }).then(response => {
        if (response.status !== 200) {
          console.log(`Looks like there was a problem. Status code: ${response.status}`);
	  alert("Upload fail");
            return;
        }

        response.json().then(function (data) {
		      alert("Upload OK");
        });
    })
	
});
video_player.ontimeupdate = function() {
	//currentFrame=Math.round(video_player.currentTime/duration*his_length)-1;
	//currentFrame=Math.ceil(video_player.currentTime/duration*his_length)-1;
	currentFrame=Math.trunc(video_player.currentTime/duration*his_length);
	alert(video_player.currentTime+' '+(video_player.currentTime/duration*his_length)+' '+currentFrame);
	window.chart.update();
};


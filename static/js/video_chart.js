video_player=document.getElementById("video_player")
var x,y,duration,time,currentFrame,his_length;
currentFrame=0;
var ctx = document.getElementById('myChart').getContext('2d');
var chartData={
        labels: [],
        datasets: [{
            label: 'Bệnh nhân ',
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
    text: 'Tỉ lệ % diện tích khối polyp trên mỗi khung hình',
  },
  legend: {
        display: false
  },
  onClick: (evt, item) => {
    var activePoints = chart.getElementsAtEvent(evt);
    if(activePoints.length > 0)
    {
	currentFrame = activePoints[0]["_index"];
	time=(duration/his_length*(currentFrame+0.5));
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
video_player.ontimeupdate = function() {
  //currentFrame=Math.round(video_player.currentTime/duration*his_length)-1;
  //currentFrame=Math.ceil(video_player.currentTime/duration*his_length)-1;
  currentFrame=Math.trunc(video_player.currentTime/duration*his_length);
  window.chart.update();
};
function update_video_and_chart()
{
  x=[];
  y=[];
  for(i in histogram_temp)
  {
    x[i]=parseInt(i,10)+1;
    y[i]=histogram_temp[i];
  }
  chartData.labels=x;
  chartData.datasets[0].data=y;
  his_length=histogram_temp.length;
  video_player.onloadedmetadata = function() {duration=video_player.duration;};
  window.chart.update();
}
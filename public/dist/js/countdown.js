//function count( ){ 
		var countDown= new Date("Oct 8 ,  2018 10:00:00").getTime(  );
		
 		var x = setInterval(function(){
 		var now = new Date().getTime(  );
		var distance = countDown - now;
		//console.log( distance )
		var days = Math.floor(distance /(1000 * 60 * 60 * 24));
		var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  		var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  		var seconds = Math.floor((distance % (1000 * 60)) / 1000);
	//	var status = 'ACTIVE'
		
		//show them in the demo
						document.getElementById("count").innerHTML = days + "d " + hours + "h "
  + minutes + "m " + seconds + "s ";
		document.getElementById("registerbutton").style.display= "none";
		
		if (distance  < 0) {
    		clearInterval(x);
			document.getElementById('count').innerHTML = "EXPIRED";
			document.getElementById("registerbutton").style.display= "block";
    		
  		}
 	
		
 	}, 1000);
 	
//setInterval( count, 1000 );
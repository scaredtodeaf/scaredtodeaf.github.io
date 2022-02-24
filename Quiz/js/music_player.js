var AUD_OBJ = new Audio('media/default.ogg'); // Audio Object
var AUD_CTM; // Audio - Track (Current Time)
var AUD_RCT; // Audio - Track (Current Time | Raw)
var AUD_DUR; // Audio - Track (Duration)
var AUD_RDR; // Audio - Track (Duration | Raw)
var AUD_VLP = 100; // Audio - Volume Percentage

// Convert the time from the Audio Object, into a Readable Format.
function TRACK_FRT(TIME_DATA){
	if (AUD_OBJ.duration > 0 && AUD_OBJ.duration < 3600){
		return FRT_DTE = new Date(TIME_DATA * 1000).toISOString().substr(14, 5);
	} else if (AUD_OBJ.duration > 3600 && AUD_OBJ.duration < 86400){
		return FRT_DTE = new Date(TIME_DATA * 1000).toISOString().substr(11, 8);
	};
};

// Anything that needs to be repeatedly executed, goes here.
function REP_EXEC(){
	AUD_RCT = AUD_OBJ.currentTime; // Update the Raw Current Time, for precise checks.
	AUD_RDR = AUD_OBJ.duration; // Update the Raw Duration, for precise checks.
	AUD_CTM = TRACK_FRT(AUD_OBJ.currentTime); // Put the Current Time into a Readable Format.
	AUD_DUR = TRACK_FRT(AUD_OBJ.duration); // Put the Track Duration into a Readable Format.
	AUD_VLP = Math.round(AUD_OBJ.volume * 100); // Turn the Volume Amount used by JavaScript into a Readable Format (Percentage).
	
	var AUD_CBT = "";
	AUD_CBT = AUD_CBT.concat(AUD_CTM, " / ", AUD_DUR);
	$('#MP_MSI').html(AUD_CBT); // Flash the 'MP_MSI' div with the updated data.
	
	// Check if the track is paused, but finished.
	if (AUD_OBJ.paused == true && AUD_OBJ.currentTime == AUD_OBJ.duration){
		AUD_OBJ.currentTime = 0; // The track has finished, reset to the beginning.
	};
	
	// Change the Icon for the Play Button, based on if the music is playing or not.
	if (AUD_OBJ.paused == true){
		document.getElementById("MP_PPB").src = "img/play.png";
		document.getElementById("MP_PPB").alt = "Play";
		document.getElementById("MP_PPB").title = "Play";
	} else if (AUD_OBJ.paused == false){
		document.getElementById("MP_PPB").src = "img/pause.png";
		document.getElementById("MP_PPB").alt = "Pause";
		document.getElementById("MP_PPB").title = "Pause";
	};
	
	if (AUD_OBJ.muted == true){
		document.getElementById("MP_MUMB").alt = "Muted";
		document.getElementById("MP_MUMB").title = "Muted";
		
		if (AUD_OBJ.volume >= 0 && AUD_OBJ.volume <= 0.3399999999999999){
			document.getElementById("MP_MUMB").src = "img/mute_1.png";
		} else if (AUD_OBJ.volume >= 0.34 && AUD_OBJ.volume <= 0.66999999999999999){
			document.getElementById("MP_MUMB").src = "img/mute_2.png";
		} else if (AUD_OBJ.volume >= 0.67 && AUD_OBJ.volume <= 1){
			document.getElementById("MP_MUMB").src = "img/mute_3.png";
		};
	} else if (AUD_OBJ.muted == false){
		var AUD_APT = "";
		AUD_APT = AUD_APT.concat(AUD_VLP, "%");
		document.getElementById("MP_MUMB").alt = AUD_APT;
		document.getElementById("MP_MUMB").title = AUD_APT;
		
		if (AUD_OBJ.volume >= 0 && AUD_OBJ.volume <= 0.33){
			document.getElementById("MP_MUMB").src = "img/volume_1.png";
		} else if (AUD_OBJ.volume >= 0.34 && AUD_OBJ.volume <= 0.66){
			document.getElementById("MP_MUMB").src = "img/volume_2.png";
		} else if (AUD_OBJ.volume >= 0.67 && AUD_OBJ.volume <= 1){
			document.getElementById("MP_MUMB").src = "img/volume_3.png";
		};
	};
};

// Load a Track into Player, and correct variables.
function LOAD_TRACK(TRACK_ID) {
	var CCT_LNK = ""; // Concatenated Link to Load.
	if (AUD_OBJ.paused == false){
		AUD_OBJ.pause();
	};
	
	AUD_OBJ.currentTime = 0; // Put the Current Time back to 0.
	CCT_LNK = CCT_LNK.concat("media/", TRACK_ID, ".mp3"); // Concatenate the TRACK_ID into a Readable Link.
	AUD_OBJ.src = CCT_LNK; // Load that file into the Audio Object.
	AUD_OBJ.load(); // Reload the Audio Object, to refresh properties.
};

// Everything to be done once the page is ready.
$(document).ready(function(){
	
	// Request that the REP_EXEC() function is called, every 100ms.
	repExec = setInterval("REP_EXEC()", 100);
	
	// Change the Play / Pause Stop Icon's contrast depending on whether the mouse is or isn't over it.
	$(function () {
		$('#MP_PP').hover(function(){
			document.getElementById("MP_PPB").style.filter = "contrast(50%)";
		}, function () {
			document.getElementById("MP_PPB").style.filter = "contrast(100%)";
		});
	});
	
	// Play / Pause the Player
	$('#MP_PP').click(function(){
		if (AUD_OBJ.paused == true){
			AUD_OBJ.play();
			
		} else if (AUD_OBJ.paused == false){
			AUD_OBJ.pause();
		};
	});
	
	// Change the Stop Icon's contrast depending on whether the mouse is or isn't over it.
	$(function () {
		$('#MP_STP').hover(function(){
			document.getElementById("MP_STPB").style.filter = "contrast(50%)";
		}, function () {
			document.getElementById("MP_STPB").style.filter = "contrast(100%)";
		});
	});
	
	// Stop the Player
	$('#MP_STP').click(function(){
		if (AUD_OBJ.paused == false){
			AUD_OBJ.pause();
		};
		
		AUD_OBJ.currentTime = 0;
	});
	
	// Change the Mute / Unmute Icon's contrast depending on whether the mouse is or isn't over it,
	// Change the volume level based on scroll direction.
	$(function () {
		$('#MP_MUM').hover(function(){
			document.getElementById("MP_MUMB").style.filter = "contrast(50%)";
			
			document.getElementById("MP_MUMB").addEventListener("wheel", function(){
				if (event.deltaY < 0) {
					if (AUD_OBJ.volume < 100){
						AUD_OBJ.volume += 0.01;
					};
				} else if (event.deltaY > 0) {
					if (AUD_OBJ.volume > 0){
						AUD_OBJ.volume -= 0.01;
					};
				};
			});
		}, function () {
			document.getElementById("MP_MUMB").style.filter = "contrast(100%)";
		});
	});
	
	// Mute / Unmute the Player.
	$('#MP_MUM').click(function(){
		if (AUD_OBJ.muted == true){
			AUD_OBJ.muted = false;
			
		} else if (AUD_OBJ.muted == false){
			AUD_OBJ.muted = true;
		};
	});
});
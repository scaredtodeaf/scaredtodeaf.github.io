var AUD_OBJ = new Audio('media/0000000.mp3'); // Audio Object
var AUD_CTM; // Audio - Track (Current Time)
var AUD_RCT; // Audio - Track (Current Time | Raw)
var AUD_DUR; // Audio - Track (Duration)
var AUD_RDR; // Audio - Track (Duration | Raw)
var AUD_VLP = 100; // Audio - Volume Percentage
var BTN_CKI = new Audio('media/sfx/button_pressin.ogg'); // SFX - Button (Click In)
var BTN_CKO = new Audio('media/sfx/button_pressout.ogg'); // SFX - Button (Click Out)
BTN_CKO.volume = 0.8; // Volume Level - BTN_CKO
BTN_CKI.volume = 0.8; // Volume Level - BTN_CKI

// Convert the time from the Audio Object, into a Readable Format.
function TRACK_FRT(TIME_DATA){
	if (AUD_OBJ.duration > 0 && AUD_OBJ.duration < 3600){
		return FRT_DTE = new Date(TIME_DATA * 1000).toISOString().substr(14, 5);
	} else if (AUD_OBJ.duration > 3600 && AUD_OBJ.duration < 86400){
		return FRT_DTE = new Date(TIME_DATA * 1000).toISOString().substr(11, 8);
	};
};

// Function to calculate the percentage amount of one variable, against another.
function CALC_PERCENTAGES(DATA_A, DATA_B){
	return (DATA_A / DATA_B) * 100;
};

// Anything that needs to be repeatedly executed, goes here.
function REP_EXEC(){
	AUD_RCT = AUD_OBJ.currentTime; // Update the Raw Current Time, for precise checks.
	AUD_RDR = AUD_OBJ.duration; // Update the Raw Duration, for precise checks.
	AUD_CTM = TRACK_FRT(AUD_OBJ.currentTime); // Put the Current Time into a Readable Format.
	AUD_DUR = TRACK_FRT(AUD_OBJ.duration); // Put the Track Duration into a Readable Format.
	AUD_VLP = Math.round(AUD_OBJ.volume * 100); // Turn the Volume Amount used by JavaScript into a Readable Format (Percentage).
	
	var AUD_CBT = '';
	if (AUD_CTM != null && AUD_DUR != null){
		if (AUD_RCT != null && AUD_RDR != null){
			var BARW_POS = CALC_PERCENTAGES(AUD_RCT, AUD_RDR);
			$('body').css('background', 'linear-gradient(to right, #83bff4 0%, #83bff4 ' + BARW_POS + '%, #afd4f5 ' + BARW_POS + '%, #7db9e8 100%)');
			
			AUD_CBT = AUD_CBT.concat(AUD_CTM, ' / ', AUD_DUR);
		};
	} else {
		$('body').css('background', 'linear-gradient(90deg, #83bff4 0%, #afd4f5 100%)'); 
		AUD_CBT = '00:00 / 00:00';
	};

	$('#MP_MSI').html(AUD_CBT); // Flash the 'MP_MSI' div with the updated data.
	
	// Change the Icon for the Play Button, based on if the music is playing or not.
	if (AUD_OBJ.paused == true){
		document.getElementById('MP_PPB').src = 'img/play.png';
		document.getElementById('MP_PPB').alt = 'Play';
		document.getElementById('MP_PPB').title = 'Play';
	} else if (AUD_OBJ.paused == false){
		document.getElementById('MP_PPB').src = 'img/pause.png';
		document.getElementById('MP_PPB').alt = 'Pause';
		document.getElementById('MP_PPB').title = 'Pause';
	};
	
	if (AUD_OBJ.muted == true){
		document.getElementById('MP_MUMB').alt = 'Muted';
		document.getElementById('MP_MUMB').title = 'Muted';
		
		if (AUD_OBJ.volume >= 0 && AUD_OBJ.volume <= 0.3399999999999999){
			document.getElementById('MP_MUMB').src = 'img/mute_1.png';
		} else if (AUD_OBJ.volume >= 0.34 && AUD_OBJ.volume <= 0.66999999999999999){
			document.getElementById('MP_MUMB').src = 'img/mute_2.png';
		} else if (AUD_OBJ.volume >= 0.67 && AUD_OBJ.volume <= 1){
			document.getElementById('MP_MUMB').src = 'img/mute_3.png';
		};
	} else if (AUD_OBJ.muted == false){
		var AUD_APT = '';
		AUD_APT = AUD_APT.concat(AUD_VLP, '%');
		document.getElementById('MP_MUMB').alt = AUD_APT;
		document.getElementById('MP_MUMB').title = AUD_APT;
		
		if (AUD_OBJ.volume >= 0 && AUD_OBJ.volume <= 0.33){
			document.getElementById('MP_MUMB').src = 'img/volume_1.png';
		} else if (AUD_OBJ.volume >= 0.34 && AUD_OBJ.volume <= 0.66){
			document.getElementById('MP_MUMB').src = 'img/volume_2.png';
		} else if (AUD_OBJ.volume >= 0.67 && AUD_OBJ.volume <= 1){
			document.getElementById('MP_MUMB').src ='img/volume_3.png';
		};
	};
};

// Load a Track into Player, and correct variables.
function LOAD_TRACK(TRACK_ID){
	var CCT_LNK = ''; // Concatenated Link to Load.
	if (AUD_OBJ.paused == false){
		AUD_OBJ.pause();
	};
	
	AUD_OBJ.currentTime = 0; // Put the Current Time back to 0.
	CCT_LNK = CCT_LNK.concat('media/', TRACK_ID, '.mp3'); // Concatenate the TRACK_ID into a Readable Link.
	AUD_OBJ.src = CCT_LNK; // Load that file into the Audio Object.
	AUD_OBJ.load(); // Reload the Audio Object, to refresh properties.
	$('body').css('background', 'linear-gradient(to right, #83bff4 0%, #83bff4 0%, #afd4f5 0%, #7db9e8 100%)'); // Reset the width of the Progress Bar.
};

// Everything to be done once the page is ready.
$(document).ready(function(){
	
	// Request that the REP_EXEC() function is called, every 100ms.
	repExec = setInterval('REP_EXEC()', 100);
	
	// Change the Play / Pause Stop Icon's contrast depending on whether the mouse is or isn't over it.
	$(function (){
		$('#MP_PP').hover(function(){
			document.getElementById('MP_PPB').style.filter = 'contrast(50%)';
		}, function (){
			document.getElementById('MP_PPB').style.filter = 'contrast(100%)';
		});
	});
	
	// Play / Pause the Player
	$('#MP_PP').click(function(){
		if (AUD_OBJ.paused == true){
			BTN_CKO.play();
			AUD_OBJ.play();
			
		} else if (AUD_OBJ.paused == false){
			BTN_CKI.play();
			AUD_OBJ.pause();
		};
	});
	
	// Change the Stop Icon's contrast depending on whether the mouse is or isn't over it.
	$(function (){
		$('#MP_STP').hover(function(){
			document.getElementById('MP_STPB').style.filter = 'contrast(50%)';
		}, function (){
			document.getElementById('MP_STPB').style.filter = 'contrast(100%)';
		});
	});
	
	// Stop the Player
	$('#MP_STP').click(function(){
		BTN_CKI.play();

		if (AUD_OBJ.paused == false){
			AUD_OBJ.pause();
		};
		
		AUD_OBJ.currentTime = 0;
	});
	
	// Change the Mute / Unmute Icon's contrast depending on whether the mouse is or isn't over it,
	// Change the volume level based on scroll direction.
	$(function (){
		$('#MP_MUM').hover(function(){
			document.getElementById('MP_MUMB').style.filter = 'contrast(50%)';
			
			document.getElementById('MP_MUMB').addEventListener('wheel', function(event){
				if (event.deltaY < 0){
					if (AUD_OBJ.volume < 1){
						AUD_OBJ.volume += 0.01;
					};
				} else if (event.deltaY > 0){
					if (AUD_OBJ.volume > 0){
						AUD_OBJ.volume -= 0.01;
					};
				};
			});
		}, function (){
			document.getElementById('MP_MUMB').style.filter = 'contrast(100%)';
		});
	});
	
	// Mute / Unmute the Player.
	$('#MP_MUM').click(function(){
		if (AUD_OBJ.muted == true){
			BTN_CKO.play();
			AUD_OBJ.muted = false;
			
		} else if (AUD_OBJ.muted == false){
			BTN_CKI.play();
			AUD_OBJ.muted = true;
		};
	});
});
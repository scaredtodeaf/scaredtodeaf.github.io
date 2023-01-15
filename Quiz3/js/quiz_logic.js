var QUIZ_ID = 'WCmQ63uzSMge8aIR'; // The ID for this quiz.
var QUIZ_DATA = new Array(); // The Quiz Data
var SG_DATA = new Array(); // The User's Save Data.
var SG_KEY = ''; // The User's Key.
var IS_BLOCKING = true; // Is the 'Hover Alert' blocking?
var TID; // This ID
var ETID; // Edited TID
var LTID; // Last TID
var CUR_ANSE; // Current Answer - Edited
var CUR_ANSR; // Current Answer - Raw
var FF_CLIP = new Audio('media/9999999.mp3'); // Music Track
var BTN_CLK = new Audio('media/SFX/button_click.ogg'); // SFX - Button Click
var RGT_ANS = new Audio('media/SFX/right_answer.ogg'); // SFX - Right Answer
var RNG_ANS = new Audio('media/SFX/wrong_answer.ogg'); // SFX - Wrong Answer
var HNT_KPR = new Audio('media/SFX/hint_keeper.ogg'); // SFX - Phantasmagoria's Hint Keeper Line
HNT_KPR.volume = 0.8; // Volume Level - HNT_KPR
RNG_ANS.volume = 0.6; // Volume Level - RNG_ANS
RGT_ANS.volume = 0.6; // Volume Level - RGT_ANS
BTN_CLK.volume = 0.8; // Volume Level - BTN_CLK
FF_CLIP.volume = 1; // Volume Level - FF_CLIP


function LOAD_DATA(REQUEST_TYPE, KEY_NAME, DATA_TYPE=1){
	if (REQUEST_TYPE == 0){ // Check if Data Exists.
		var LD_TEST_REQUEST = window.localStorage.getItem(KEY_NAME);
		console.log(LD_TEST_REQUEST);
		if (LD_TEST_REQUEST != null){
			return true;
		} else if (LD_TEST_REQUEST == null){
			return false;
		};
	} else if (REQUEST_TYPE == 1){ // Request Data.
		if (DATA_TYPE == 0){ // Standard Data. String, Bool, etc.
			var REQUEST_DATA = window.localStorage.getItem(KEY_NAME);
			return REQUEST_DATA;
		} else if (DATA_TYPE == 1){ // Arrays.
			var REQUEST_DATA = window.localStorage.getItem(KEY_NAME);
			REQUEST_DATA = JSON.parse(REQUEST_DATA);
			return REQUEST_DATA;
		};
	};
};

function SAVE_DATA(KEY_NAME, DATA_TO_SAVE, DATA_TYPE=1){
	if (DATA_TYPE == 0){ // Standard Data. String, Bool, etc.
		window.localStorage.setItem(KEY_NAME, DATA_TO_SAVE);
	} else if (DATA_TYPE == 1){ // Arrays.
		var SEND_DATA = JSON.stringify(DATA_TO_SAVE);
		window.localStorage.setItem(KEY_NAME, SEND_DATA);
	};
};

// Create Div 'Buttons' from the Quiz Data and append them into the 'BTN_C' Div. 
function MAKE_DIVS_FROM_QDATA(){
	var LOADABLE_DATA = false;
	if (LOAD_DATA(0, 'QGSaveData') == true){
		if (LOAD_DATA(0, 'QGKey') == true){
			LOADABLE_DATA = true;
			var LOCAL_SG_DATA = (LOAD_DATA(1, 'QGSaveData'));
			var LOCAL_SG_KEY = (LOAD_DATA(1, 'QGKey', 0));

			if (LOCAL_SG_KEY == QUIZ_ID){
				if (LOCAL_SG_DATA.length == QUIZ_DATA.length){
					LOADABLE_DATA = true;
					SG_DATA = LOCAL_SG_DATA;
					SG_KEY = LOCAL_SG_KEY;
				} else {
					LOADABLE_DATA = false;
				};
			} else {
				LOADABLE_DATA = false;
			};
		} else if (LOAD_DATA(0, 'QGKey') == false){
			LOADABLE_DATA = false;
		}; 
	} else if (LOAD_DATA(0, 'QGSaveData') == false){
		LOADABLE_DATA = false;
	};

	for(var i=0; i<QUIZ_DATA.length; i++){
		var TOTAL_COUNT = i+1;
		$('#BTN_C').append('<div class="BTN_I" isClickable=true isSelected=false hintUnlocked=false hintClicked=false TID=' + TOTAL_COUNT + '>' + TOTAL_COUNT + '</div>');

		if (LOADABLE_DATA == false){
			SG_DATA[i] = new Array(true, false, false);
		};
	};

	if (LOADABLE_DATA == true){
		for(var i=0; i<QUIZ_DATA.length; i++){
			$('.BTN_I:eq(' + i + ')').attr('isClickable', SG_DATA[i][0]);
			$('.BTN_I:eq(' + i + ')').attr('hintUnlocked', SG_DATA[i][1]);
			$('.BTN_I:eq(' + i + ')').attr('hintClicked', SG_DATA[i][2]);

			if ($('.BTN_I:eq(' + i + ')').attr('isClickable') == 'false'){
				$('.BTN_I:eq(' + i + ')').css('backgroundColor', '#e5991e');
				$('.BTN_I:eq(' + i + ')').css('font-size', '8pt');
				$('.BTN_I:eq(' + i + ')').text(GEN_GAMEINFO(i));
			};
		};

	} else if (LOADABLE_DATA == false){
		SAVE_DATA('QGSaveData', SG_DATA);
		SAVE_DATA('QGKey', QUIZ_ID, 0);
	};
};

// Function to Retrieve a json and return the resulting content.
async function LOAD_AND_PARSE_QDATA(JSON_FILE){
	var FTCH_FAILED = false;
	var JSON_DATA = await fetch(JSON_FILE).then(response => response.json().then(data => {return data;})).catch(FTCH_FAILED = true);
	
	// Code to make sure we don't continue until we get the JSON_DATA or FTCH_FAILED is true.
	while (JSON_DATA === null && FTCH_FAILED === false){};

	if (JSON_DATA != null){
		var STRING_FROM_JSON = JSON.stringify(JSON_DATA);
		var ARRAY_FROM_JSON = JSON.parse(STRING_FROM_JSON);
		
		for(var i = 0; i<ARRAY_FROM_JSON.length; i++){
			QUIZ_DATA[i] = new Array (
				ARRAY_FROM_JSON[i]['ID'], 
				ARRAY_FROM_JSON[i]['Name'], 
				ARRAY_FROM_JSON[i]['Title'], 
				ARRAY_FROM_JSON[i]['Hint'], 
				ARRAY_FROM_JSON[i]['Keywords']
			);
		};

		MAKE_DIVS_FROM_QDATA();
	} else {
		return false;
	};
};

// Prepare a string for comparison with another, by stripping certain characters and converting to lowercase.
function PREP_FOR_COMPARE(STRING, MODE){
	if (MODE == 0){
		// Get rid of all characters which are non-alphanumeric (including spaces).
		STRING = STRING.replace(/[^0-9A-z]+/g, '');
	} else if (MODE == 1){
		// Same as above, but excluding (){}|[], as they can be potentially used for
		// Powerful Keywords, e.g: "(Sid Meier's) [[Civ(ilization)] {IV|4}".
		STRING = STRING.replace(/[^0-9A-z(){}|[\]]+/g, '');
	}; 
	
	// Convert the String to Lower Case
	STRING = STRING.toLowerCase();
	
	// Return the results.
	return STRING;
};

// Parse and return the Game's Name and Track.
function GEN_GAMEINFO(GID){
	var GAM_INF = ''; // Game Info
	
	if (QUIZ_DATA[GID][1].length > 0 && QUIZ_DATA[GID][2].length > 0){ // If both items have information...
		// ...Concatenate them both together with a hyphen between them.
		GAM_INF += QUIZ_DATA[GID][1]; GAM_INF += ' - '; GAM_INF += QUIZ_DATA[GID][2];
	} else if (QUIZ_DATA[GID][1].length > 0 && QUIZ_DATA[GID][2].length == 0){ // If only the first item has information...
		// ...Only return the game name as the Game Info.
		GAM_INF += QUIZ_DATA[GID][1];
	};
	
	// Return this information to whatever called it.
	return GAM_INF;
}

// Data for the 'Hover Alert' that appears when loading the game.
function SET_HOVER_ALERT(){
	$('#HVR_ALT_HDR').text('Welcome to the Video Game Music Quiz!');
	$('#HVR_ALT_TXT').text('This is the Video Game Music Quiz, where you\'ll listen to tracks from ' + QUIZ_DATA.length + ' different games, widely ranging in style and era. Click the numbered buttons to listen to a 30-40 second excerpt from the track. When you\'re ready to guess the game, type your answer into the Text Box in the top right. If you\'re stuck on a certain track, you can click the Hint Bar for a hint alluding to the game, after half the track has played. There is no points system, so you will not be punished for using the hints system... All we ask is that you try your best to guess the answer, before clicking the Hint Bar.');
	$('#HVR_ALT_BTN').text('Okay');
};

// Anything that needs to be repeatedly executed, goes here.
function REP_CHECK(){
	// Code to make sure the Game Area is always the height of the page, minus the Header Area and is positioned correctly.
	var GA_HEIGHT = $(window).height() - $('#HDR').height(); // Game Area Height: (Page Height - Header Height)
	$('#GA').css('height', GA_HEIGHT + 'px'); // Set Game Area Height.
	$('#GA').css('top', $('#HDR').height() + 'px'); // Set Game Area Position.

	if (IS_BLOCKING == true){
		SET_HOVER_ALERT();
	};

	if (TID != null){
		if ((LTID != TID) && LTID != null){
			if ($('.BTN_I:eq(' + (LTID-1) + ')').attr('isClickable') == 'true'){
				if ($('.BTN_I:eq(' + (LTID-1) + ')').attr('isClickable') == 'true'){
					if($('.BTN_I:eq(' + (LTID-1) + ')').css('backgroundColor') == 'rgb(30, 229, 123)'){
						$('.BTN_I:eq(' + (LTID-1) + ')').css('backgroundColor', '#1e88e5');
					};
				};
			};
		};

		LTID = TID;

		if ($('#MP_ANSR').attr('disabled') == null && $('.BTN_I:eq(' + LTID + ')').attr('isClickable') == 'true'){
			if(!$('#MP_ANSR').is(':focus')){
				$('#MP_ANSR').focus();
			};
		}

		if ($('.BTN_I:eq(' + ETID + ')').attr('hintUnlocked') == 'true'){
			if ($('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'true'){
				if ($('.BTN_I:eq(' + ETID + ')').attr('hintClicked') == 'true'){
					$('#HB').text(QUIZ_DATA[ETID][3]);
				} else if ($('.BTN_I:eq(' + ETID + ')').attr('hintClicked') == 'false'){
					$('#HB').text('You can now click for a hint!');
				};
			} else if ($('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'false'){
				if ($('.BTN_I:eq(' + ETID + ')').attr('hintClicked') == 'true'){
					$('#HB').text(QUIZ_DATA[ETID][3]);
				} else if ($('.BTN_I:eq(' + ETID + ')').attr('hintClicked') == 'false'){
					var HB_STRING = '';
					HB_STRING = HB_STRING.concat('Congratulations on guessing that this track was from ', QUIZ_DATA[ETID][1], '! If you still wish to see the hint, click here.');
					$('#HB').text(HB_STRING);
				};
			};
		} else if ($('.BTN_I:eq(' + ETID + ')').attr('hintUnlocked') == 'false'){
			if ($('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'true'){
				var HB_STRING = '';
				var TRK_SL = Math.round(AUD_RCT - (AUD_RDR / 2));
				if (TRK_SL < 0){TRK_SL = Math.abs(TRK_SL);};
				
				if (AUD_OBJ.paused != true){
					if (isNaN(TRK_SL) != true){
						HB_STRING = HB_STRING.concat('You can click here for a hint in roughly ', TRK_SL, ' seconds.');
						$('#HB').text(HB_STRING);
						if (TRK_SL == 0){
							$('.BTN_I:eq(' + ETID + ')').attr('hintUnlocked', true);
							SG_DATA[ETID][1] = true; //hintUnlocked
							SAVE_DATA('QGSaveData', SG_DATA);
						};
					};
				};
			} else if ($('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'false'){
				var HB_STRING = '';
				HB_STRING = HB_STRING.concat('Congratulations on guessing that this track was from ', QUIZ_DATA[ETID][1], '! If you still wish to see the hint, click here.');
				$('#HB').text(HB_STRING);
			};
		};
		
		var ANS_ARRAY = QUIZ_DATA[ETID][4];
		for (var i=0; i<ANS_ARRAY.length; i++){ANS_ARRAY[i] = PREP_FOR_COMPARE(ANS_ARRAY[i], 1);};
		
		CUR_ANSE = PREP_FOR_COMPARE($('#MP_ANSR').val(), 0);
		CUR_ANSR = $('#MP_ANSR').val();

		if (!document.all) {
			var ANS_MATCHES = 0;
			for (var i=0; i<ANS_ARRAY.length; i++){
				if (CUR_ANSE.includes(ANS_ARRAY[i]) == true){
					ANS_MATCHES += 1;
				};
			};

			if (ANS_MATCHES > 0){
				if ($('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'true'){
					$('#MP_ANSR').attr('disabled', true);
					$('#MP_ANSR').css('backgroundColor', '#e5991e');
					$('#MP_ANSR').val('');
					RGT_ANS.play();
					AUD_OBJ.pause();
					
					$('.BTN_I:eq(' + ETID + ')').css('backgroundColor', '#e5991e');
					$('.BTN_I:eq(' + ETID + ')').css('font-size', '8pt');
					$('.BTN_I:eq(' + ETID + ')').text(GEN_GAMEINFO(ETID));
					$('.BTN_I:eq(' + ETID + ')').attr('isClickable', false);
					$('.BTN_I:eq(' + ETID + ')').attr('isSelected', false);
					SG_DATA[ETID][0] = false; //isClickable
					SAVE_DATA('QGSaveData', SG_DATA);
					
					setTimeout(function(){$('#MP_ANSR').css('backgroundColor', '#1e88e5');}, 1000);
				};
			};
		} else {
			if ($.inArray(CUR_ANSE, ANS_ARRAY) >= 0){
				if ($('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'true'){
					$('#MP_ANSR').attr('disabled', true);
					$('#MP_ANSR').css('backgroundColor', '#e5991e');
					$('#MP_ANSR').val('');
					RGT_ANS.play();
					AUD_OBJ.pause();
					
					$('.BTN_I:eq(' + ETID + ')').css('backgroundColor', '#e5991e');
					$('.BTN_I:eq(' + ETID + ')').css('font-size', '8pt');
					$('.BTN_I:eq(' + ETID + ')').text(GEN_GAMEINFO(ETID));
					$('.BTN_I:eq(' + ETID + ')').attr('isClickable', false);
					$('.BTN_I:eq(' + ETID + ')').attr('isSelected', false);
					SG_DATA[ETID][0] = false; //isClickable
					SAVE_DATA('QGSaveData', SG_DATA);
					
					setTimeout(function(){$('#MP_ANSR').css('backgroundColor', '#1e88e5');}, 1000);
				};
			};
		};
	} else if (TID == null){
		if(!$('#MP_ANSR').is(':focus')){
			$('#MP_ANSR').focus();
		};
		
		$('#MP_ANSR').attr('disabled', false);
		$('#HB').html('I am the official hintkeeper, I watch your every move! Ask me for a hint if you are hopelessly stuck, but use me sparingly; Too many hints can spoil the game!');

		var CHECK_LIST = ['Tetris'];
		for (var i=0; i<CHECK_LIST.length; i++){CHECK_LIST[i] = PREP_FOR_COMPARE(CHECK_LIST[i], 1);};

		CUR_ANSE = PREP_FOR_COMPARE($('#MP_ANSR').val(), 0);
		CUR_ANSR = $('#MP_ANSR').val();

		if (!document.all) {
			var ANS_MATCHES = 0;
			for (var i=0; i<CHECK_LIST.length; i++){
				if (CUR_ANSE.includes(CHECK_LIST[i]) == true){
					ANS_MATCHES += 1;
				};
			};

			if (ANS_MATCHES > 0){
				$('#MP_ANSR').css('backgroundColor', '#e5991e');
				$('#MP_ANSR').val('');
				RGT_ANS.play();
				AUD_OBJ.pause();
				
				setTimeout(function(){$('#MP_ANSR').css('backgroundColor', '#1e88e5'); FF_CLIP.play();}, 1000);
			};

		} else {
			if ($.inArray(CUR_ANSE, CHECK_LIST) >= 0){
				$('#MP_ANSR').css('backgroundColor', '#e5991e');
				$('#MP_ANSR').val('');
				RGT_ANS.play();
				AUD_OBJ.pause();
				
				setTimeout(function(){$('#MP_ANSR').css('backgroundColor', '#1e88e5'); FF_CLIP.play();}, 1000);
			};
		};
	};
};

// Everything to be done once the page is ready.
$(document).ready(function(){
	
	// Call this function.
	LOAD_AND_PARSE_QDATA('game_data.json');

	// Request that the REP_CHECK() function is called, every 100ms.
	repCheck = setInterval('REP_CHECK()', 100);

	if (IS_BLOCKING == true){
		$(function (){
			$('#DEL_DATA').hover(function(){
				document.getElementById('DEL_DATA').style.filter = 'contrast(50%)';
			}, function (){
				document.getElementById('DEL_DATA').style.filter = 'contrast(100%)';
			});
		});

		$('#DEL_DATA').on('click', function(event){
			BTN_CLK.play();

			setTimeout(function(){
				window.localStorage.removeItem('QGKey');
				window.localStorage.removeItem('QGSaveData');
				document.location.reload(true);
			}, 500);
		});

		$(function (){
			$('#HVR_ALT_BTN').hover(function(){
				document.getElementById('HVR_ALT_BTN').style.filter = 'contrast(50%)';
			}, function (){
				document.getElementById('HVR_ALT_BTN').style.filter = 'contrast(100%)';
			});
		});
	
		$('#HVR_ALT_BTN').on('click', function(event){
			BTN_CLK.play();

			setTimeout(function(){
				$('#HVR_ALT').remove();
				$('#OVERLAY').remove();
				IS_BLOCKING = false;
			}, 500);
		});
	};

	$('#BTN_C').on('mouseenter','.BTN_I', function(event){
		if ($(this).attr('isClickable') == 'true' && $(this).attr('isSelected') == 'false'){
			$(this).css('filter', 'contrast(50%)');
		};
	});

	$('#BTN_C').on('mouseleave','.BTN_I', function(event){
		if ($(this).attr('isClickable') == 'true' && $(this).attr('isSelected') == 'false'){
			$(this).css('filter', 'contrast(100%)');
		};
	});

	// Check if a button on the user's keyboard has been lifted.
	$(document).keyup(function(event){
		if ($('#MP_ANSR').is(':focus')){
			if (event.which === 13){
				$('#MP_ANSR').attr('disabled', true);
				$('#MP_ANSR').css('backgroundColor', '#e5351e');
				$('#MP_ANSR').val('');
				RNG_ANS.play();

				setTimeout(function(){$('#MP_ANSR').css('backgroundColor', '#1e88e5'); $('#MP_ANSR').attr('disabled', false); $('#MP_ANSR').focus();}, 1300);
			};
		};
	});
	
	$('#BTN_C').on('click','.BTN_I', function(event){
		if ($(this).attr('isClickable') == 'true'){
			if ($(this).attr('isSelected') == 'false'){	
				$('#MP_ANSR').val('');
				$('#MP_ANSR').attr('disabled', false);
				$(this).css('backgroundColor', '#1ee57b');
				$(this).attr('isSelected', true);
				
				if (ETID != null){
					$('.BTN_I:eq(' + ETID + ')').attr('isSelected', false);
				};
				
				TID = $(this).attr('TID');
				ETID = TID - 1;
				$('.BTN_I:eq(' + ETID + ')').css('filter', 'contrast(100%)');
				LOAD_TRACK(QUIZ_DATA[ETID][0]);
				BTN_CLK.play();
				setTimeout(function(){AUD_OBJ.play(); $('#MP_ANSR').focus();}, 450);
			};
		} else {
			if ($(this).attr('isSelected') == 'false'){
				if ($('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'true'){
					$('.BTN_I:eq(' + ETID + ')').css('backgroundColor', '#1e88e5');
					$('.BTN_I:eq(' + ETID + ')').attr('isSelected', false);
				};

				TID = $(this).attr('TID');
				ETID = TID - 1;

				LOAD_TRACK(QUIZ_DATA[($(this).attr('TID'))-1][0]);
				BTN_CLK.play();
				setTimeout(function(){AUD_OBJ.play();}, 450);
			};
		};
    });
	
	$('#HB').click(function(event){
		if ($(this).attr('isClickable') == 'true'){
			if (TID != null){
				if ($('.BTN_I:eq(' + ETID + ')').attr('hintUnlocked') == 'true' || $('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'false'){
					if ($('.BTN_I:eq(' + ETID + ')').attr('hintClicked') == 'false'){
						$('.BTN_I:eq(' + ETID + ')').attr('hintClicked', true);
						$('#HB').html(QUIZ_DATA[ETID][3]);
						SG_DATA[ETID][2] = true; //hintClicked
						SAVE_DATA('QGSaveData', SG_DATA);
					};

					if  ($('.BTN_I:eq(' + ETID + ')').attr('isClickable') == 'false'){
						$('.BTN_I:eq(' + ETID + ')').attr('hintUnlocked', true);
						SG_DATA[ETID][2] = true; //hintClicked
						SAVE_DATA('QGSaveData', SG_DATA);
					};
				};
			} else {
				HNT_KPR.play();
			};
		};
	});
});
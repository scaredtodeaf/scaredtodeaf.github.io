var QUIZ_DATA = new Array(); // The Quiz Data
var TID; // This ID
var ETID; // Edited TID
var LTID; // Last TID
var CUR_ANSE; // Current Answer - Edited
var CUR_ANSR; // Current Answer - Raw
var BTN_CLK = new Audio('media/SFX/button_click.ogg'); // SFX - Button Click
var RGT_ANS = new Audio('media/SFX/right_answer.ogg'); // SFX - Right Answer
var RNG_ANS = new Audio('media/SFX/wrong_answer.ogg'); // SFX - Wrong Answer
var HNT_KPR = new Audio('media/SFX/hint_keeper.ogg'); // SFX - Phantasmagoria's Hint Keeper Line
HNT_KPR.volume = 0.7; // Volume Level - HNT_KPR
RNG_ANS.volume = 0.5; // Volume Level - RNG_ANS
RGT_ANS.volume = 0.7; // Volume Level - RGT_ANS
BTN_CLK.volume = 0.7; // Volume Level - BTN_CLK

// Create Div "Buttons" from the Quiz Data and append them into the 'BTN_C' Div. 
function MAKE_DIVS_FROM_QDATA() {
	for(var i=0; i<QUIZ_DATA.length; i++){
		var TOTAL_COUNT = i+1;
		$('#BTN_C').append('<div class="BTN_I" isClickable=true hintUnlocked=false TID=' + TOTAL_COUNT + '>' + TOTAL_COUNT + '</div>');
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

// Utilize Built-in Browser Speech Synthesis to speak something.
function SPEAK_TEXT(TEXT_TO_SPEAK, TALK_PITCH=1, TALK_RATE=0.7, TALK_VOLUME=0.6){
	var synth = window.speechSynthesis;
	var voices = synth.getVoices();
	var FOUND_VOICE = voices.filter(function(voice){
		return voice.name == 'Google US English'; 
	});
	
	if(FOUND_VOICE.length === 1){
		var SPEAK_THIS = new SpeechSynthesisUtterance(TEXT_TO_SPEAK);
		SPEAK_THIS.voice = FOUND_VOICE[0];
		SPEAK_THIS.pitch = TALK_PITCH;
		SPEAK_THIS.rate = TALK_RATE;
		SPEAK_THIS.volume = TALK_VOLUME;
		synth.speak(SPEAK_THIS);
		return true;
	} else {
		return false;
	}
};


// Function to query if the Built-in Browser Speech Synthesis is speaking or not.
function SPEAKING_TEXT(){
	var synth = window.speechSynthesis;
	return synth.speaking;
}


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
function GEN_GAMEINFO(){
	var GAM_INF = ''; // Game Info
	
	if (QUIZ_DATA[ETID][1].length > 0 && QUIZ_DATA[ETID][2].length > 0){ // If both items have information...
		// ...Concatenate them both together with a hyphen between them.
		GAM_INF += QUIZ_DATA[ETID][1]; GAM_INF += ' - '; GAM_INF += QUIZ_DATA[ETID][2];
	} else if (QUIZ_DATA[ETID][1].length > 0 && QUIZ_DATA[ETID][2].length == 0){ // If only the first item has information...
		// ...Only return the game name as the Game Info.
		GAM_INF += QUIZ_DATA[ETID][1];
	};
	
	// Return this information to whatever called it.
	return GAM_INF;
}


// Anything that needs to be repeatedly executed, goes here.
function REP_CHECK(){
	// Code to make sure the Game Area is always the height of the page, minus the Header Area and is positioned correctly.
	var GA_HEIGHT = $(window).height() - $('#HDR').height(); // Game Area Height: (Page Height - Header Height)
	$('#GA').css('height', GA_HEIGHT + 'px'); // Set Game Area Height.
	$('#GA').css('top', $('#HDR').height() + 'px'); // Set Game Area Position.
	
	// Only allow this code to run, if TID is not null.
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
		
		// Set the last TID as the current one.
		LTID = TID;
		
		var ANS_ARRAY = QUIZ_DATA[ETID][4]; // Array of Possible Answers / Keywords
		for (var i=0; i<ANS_ARRAY.length; i++){
			// Go through the array and pass each through PREP_FOR_COMPARE.
			ANS_ARRAY[i] = PREP_FOR_COMPARE(ANS_ARRAY[i], 1);
		};
		
		CUR_ANSE = PREP_FOR_COMPARE($('#MP_ANSR').val(), 0);
		CUR_ANSR = $('#MP_ANSR').val();
		
		if ($.inArray(CUR_ANSE, ANS_ARRAY) >= 0) {
			$('#MP_ANSR').attr('disabled', true);
			$('#MP_ANSR').css('backgroundColor', '#e5991e');
			$('#MP_ANSR').val('');
			RGT_ANS.play();
			AUD_OBJ.pause();
			
			$('.BTN_I:eq(' + ETID + ')').css('backgroundColor', '#e5991e');
			$('.BTN_I:eq(' + ETID + ')').css('font-size', '8pt');
			$('.BTN_I:eq(' + ETID + ')').text(GEN_GAMEINFO());
			$('.BTN_I:eq(' + ETID + ')').attr('isClickable', false);
			var CORRECT_SPEECH = ""; CORRECT_SPEECH += "Correct! That was "; CORRECT_SPEECH += $('.BTN_I:eq(' + ETID + ')').text(); CORRECT_SPEECH += "!";
			
			setTimeout(function() {$('#MP_ANSR').css('backgroundColor', '#1e88e5'); SPEAK_TEXT(CORRECT_SPEECH);}, 1000);
		};
	};
};


// Everything to be done once the page is ready.
$(document).ready(function(){
	// Call this function.
	LOAD_AND_PARSE_QDATA('game_data.json');
	
	// Kludge to prevent first call from not calling.
	SPEAK_TEXT("Word", 1, 1, 0);
	
	// Request that the REP_CHECK() function is called, every 100ms.
	repCheck = setInterval('REP_CHECK()', 100);
	
	// Check if a button on the user's keyboard has been pressed.
	$(document).keyup(function(event) {
		if (event.which === 13) {
			if ($('#MP_ANSR').is(':focus')) {
				$('#MP_ANSR').css('backgroundColor', '#e5351e');
				$('#MP_ANSR').val('');
				RNG_ANS.play();
				
				var INCORRECT_SPEECH = ""; INCORRECT_SPEECH += "Incorrect! That was not "; INCORRECT_SPEECH += CUR_ANSR; INCORRECT_SPEECH += "!";
				
				setTimeout(function() {$('#MP_ANSR').css('backgroundColor', '#1e88e5'); SPEAK_TEXT(INCORRECT_SPEECH);}, 1300);
			};
		};
	});
	
	$('#BTN_C').on('click','.BTN_I', function(){
		 if ($(this).attr('isClickable') == 'true'){
			 $('#MP_ANSR').attr('disabled', false);
			 $(this).css('backgroundColor', '#1ee57b');
			 
			 TID = $(this).attr('TID');
			 ETID = TID - 1;
			 LOAD_TRACK(QUIZ_DATA[ETID][0]);
			 
			 BTN_CLK.play();
			 
			 setTimeout(function() {AUD_OBJ.play();}, 450);
		 } else {
			 LOAD_TRACK(QUIZ_DATA[($(this).attr('TID'))-1][0]);
		 };
    });
	
	$('#HB').click(function(){
		if ($(this).attr('isClickable') == 'true'){
			if (TID != null){
				if (SPEAKING_TEXT() == false){
					$('#HB').html(QUIZ_DATA[ETID][3]);
					SPEAK_TEXT($('#HB').text());
				};
			} else {
				HNT_KPR.play();
			};
		} else {
		};
	});
});
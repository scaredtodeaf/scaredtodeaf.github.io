// Prepare Audio Objects required.
var BTN_CLK = new Audio('sfx/button_click.ogg'); // SFX - Button (Click)
var BTN_CKI = new Audio('sfx/button_pressin.ogg'); // SFX - Button (Click In)
var BTN_CKO = new Audio('sfx/button_pressout.ogg'); // SFX - Button (Click Out)
var RGT_ANS = new Audio('sfx/right_answer.ogg'); // SFX - Right Answer
var RNG_ANS = new Audio('sfx/wrong_answer.ogg'); // SFX - Wrong Answer
var SCT_ANS = new Audio('sfx/secret_answer.ogg'); // SFX - Secret Answer
BTN_CLK.volume = 0.8; // Volume Level - BTN_CLK
BTN_CKI.volume = 0.8; // Volume Level - BTN_CKI
BTN_CKO.volume = 0.8; // Volume Level - BTN_CKO
RGT_ANS.volume = 0.6; // Volume Level - RGT_ANS
RNG_ANS.volume = 0.6; // Volume Level - RNG_ANS
SCT_ANS.volume = 0.6; // Volume Level - SCT_ANS

// Handle Audio Requests
function SFXHandler(SFX_TYPE, SFX_REQ){
	if (SFX_TYPE == 0){
		switch(SFX_REQ){
			case 'PlayPauseBtn':
				var BTN_TXT = document.getElementById('play-pause-button').textContent;
				
				if (BTN_TXT == 'Play'){
					BTN_CKI.play();
				} else if (BTN_TXT == 'Pause'){
					BTN_CKO.play();
				}
				
				break;
			case 'ReplayBtn':
				BTN_CKI.play();
				break;
			case 'QuizBtn':
				BTN_CLK.play();
				break;
			
		};
	} else if (SFX_TYPE == 1){
		switch(SFX_REQ){
			case 'RightAns':
				RGT_ANS.play();
				break;
			case 'WrongAns':
				RNG_ANS.play();
				break;
			case 'SecretAns':
				SCT_ANS.play();
				break;
		};
	};
};
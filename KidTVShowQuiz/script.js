const videoPlayer = document.getElementById('video-player');

const videoButtons = document.getElementById('button-grid');
const answerInput = document.getElementById('answer-input');
const answerFeedback = document.getElementById('answer-feedback');

const playPauseButton = document.getElementById('play-pause-button');
const rewindButton = document.getElementById('rewind-button');
const volumeSlider = document.getElementById('volume-slider');

videoPlayer.src = 'QuizVideos/Welcome.webm';
answerInput.addEventListener('input', checkAnswer);

answerInput.addEventListener('keydown', (event) => {
	if (event.key === 'Enter') {
		var inputCheck = checkNumber(answerInput.value);
		
		if (!inputCheck[0]) {
			answerFeedback.innerText = 'Incorrect.';
			answerFeedback.style.color = 'red';
			SFXHandler(1, 'WrongAns');
		} else {
			answerInput.value = '';
			videoPlayer.currentTime = inputCheck[1];
			
			if (videoPlayer.paused) {
				videoPlayer.play();
			}
		}
	}
});

answerInput.form.addEventListener('submit', (event) => {
	event.preventDefault();
});

function checkNumber(matchText) {
	var specialRegex = /[^a-zA-Z0-9]/g;
	var numRegex = /^[0-9]+$/;
	var stripText = matchText.replace(specialRegex, '')
	
	if (numRegex.test(stripText)) {
		return [true, stripText];
	} else {
		return [false, stripText];
	}
}

function prepMatch(matchText) {
	return String(matchText).replace(/[^0-9a-z]+/gi, '').toLowerCase();
}

function makeDistortionCurve(amount) {
	const k = typeof amount === 'number' ? amount : 50;
	const n_samples = 44100;
	const curve = new Float32Array(n_samples);
	const deg = Math.PI / 180;
	let x;
	
	for (let i = 0; i < n_samples; ++i) {
		x = (i * 2) / n_samples - 1;
		curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
	}
	
	return curve;
}

let nodes;
let audioContext;
function handleFirstClick(){
	const thresholdValue = -10;
	const ratioValue = 4;
	const attackValue = 0.003;
	const releaseValue = 0.25;
	const bitDepth = 4;
	
	audioContext = new (window.AudioContext || window.webkitAudioContext)();
	let sourceNode = audioContext.createMediaElementSource(videoPlayer);
	let distortionNode = audioContext.createWaveShaper();
	let filterNode = audioContext.createBiquadFilter();
	let bitCrusherNode = audioContext.createScriptProcessor(4096, 1, 1);
	let muffleGainNode = audioContext.createGain();
	let compressorNode = audioContext.createDynamicsCompressor();
	let delayNode = audioContext.createDelay();
	let makeupGainNode = audioContext.createGain();
	nodes = [sourceNode, distortionNode, filterNode, bitCrusherNode, muffleGainNode, compressorNode, makeupGainNode];
	
	nodes[0].connect(audioContext.destination);
	nodes[1].curve = makeDistortionCurve(2000);
	nodes[2].type = "lowpass";
	nodes[2].frequency.value = 200;
	nodes[3].onaudioprocess = function (e) {
		var inputBuffer = e.inputBuffer.getChannelData(0);
		var outputBuffer = e.outputBuffer.getChannelData(0);
		for (var i = 0; i < inputBuffer.length; i++) {
			var step = Math.pow(1 / 2, bitDepth);
			outputBuffer[i] = Math.round(inputBuffer[i] / step) * step;
		}
	};
	nodes[4].gain.value = 0.01;
	nodes[5].threshold.setValueAtTime(thresholdValue, audioContext.currentTime);
	nodes[5].ratio.setValueAtTime(ratioValue, audioContext.currentTime);
	nodes[5].attack.setValueAtTime(attackValue, audioContext.currentTime);
	nodes[5].release.setValueAtTime(releaseValue, audioContext.currentTime);
	
	document.removeEventListener("click", handleFirstClick);
}

document.addEventListener("click", handleFirstClick);

function checkAnswer() {
	const inputValue = prepMatch(answerInput.value); // Use answerInput.value
	let isMatch = false;
	for (const keyword of video.Keywords) {
		if (inputValue === prepMatch(keyword)) {
			isMatch = true;
			break;
		}
	}
	
	if (isMatch) {
		answerFeedback.innerText = `Correct! The TV Show was ${video.Name}!`;
		answerFeedback.style.color = 'green';
		answerInput.disabled = true;
		videoPlayer.style.display = 'block';
		videoPlayer.play();
		
		const buttons = document.querySelectorAll('#button-grid button');
		for (const button of buttons) {
			if (button.videoData === video) {
				button.classList.add('correct-answer');
				//button.disabled = true;
				button.style.backgroundColor = 'green';
				SFXHandler(1, 'RightAns');
				button.innerText = button.videoData.Name;
			}
		}
		
		hintAvailable = false;
		hintShown = false;
		currentHint = '';
		saveProgress();
	
		// Show the video when the answer is correct
		videoPlayer.classList.remove('hidden-video');
		videoPlayer.currentTime = 0;
		videoPlayer.play();
	}
}

function saveProgress() {
	const progress = [];
	const buttons = document.querySelectorAll('#button-grid button');
	for (const button of buttons) {
		const buttonData = {
			id: button.videoData.ID,
			hintAvailable: button.hintAvailable,
			hintShown: button.hintShown,
			currentHint: button.currentHint
		};
		
		if (button.classList.contains('correct-answer')) {
			buttonData.isCorrect = true;
		}
		progress.push(buttonData);
	}
	localStorage.setItem('KidquizProgress', JSON.stringify(progress));
}

function loadProgress() {
	const savedProgress = localStorage.getItem('KidquizProgress');
	if (savedProgress) {
		const progress = JSON.parse(savedProgress);
		const buttons = document.querySelectorAll('#button-grid button');
		for (const button of buttons) {
			const buttonData = progress.find((data) => data.id === button.videoData.ID);
			if (buttonData) {
				if (buttonData.isCorrect) {
					button.classList.add('correct-answer');
					//button.disabled = true;
					button.style.backgroundColor = 'green';
					button.innerText = button.videoData.Name;
				}
				
				button.hintAvailable = buttonData.hintAvailable;
				button.hintShown = buttonData.hintShown;
				button.currentHint = buttonData.currentHint;
			}
		}
	}
}

let currentSelectedButton = null;

let makeupGain = null;

fetch('quiz-data.json')
.then(response => response.json())
.then(data => {
	fetch('mute_intervals.json')
	.then((response) => response.json())
	.then((muteIntervals) => {
		let isSecretVideoPlaying = false;
		
		videoPlayer.addEventListener('timeupdate', () => {
			if (!currentSelectedButton.classList.contains('correct-answer') && shouldDistVideo(video.ID, videoPlayer.currentTime)) {
				if (nodes[0].isConnected || nodes[0].numberOfOutputs > 0) {
					nodes[6].gain.value = makeupGain;
					
					nodes[0].disconnect();
					
					nodes.forEach((node, index) => {
						if (index < nodes.length - 1) {
							node.connect(nodes[index + 1]);
						} else {
							node.connect(audioContext.destination);
						}
					});
				}
			} else {
				if (!nodes[0].isConnected || nodes[0].numberOfOutputs === 0) {
					for (let i = (nodes.length - 1); i > 0; i--) {
						nodes[i].disconnect();
					}
					nodes[0].connect(audioContext.destination);
				}
			}
		});
		
		function shouldDistVideo(videoID, currentTime) {
			if (isSecretVideoPlaying || muteIntervals[videoID] === undefined) {
				return false;
			} else {
				const intervals = muteIntervals[videoID];
				for (const interval of intervals) {
					if (currentTime >= interval.start && currentTime <= interval.end) {
						makeupGain = interval.gain;
						return true;
					}
				}
				return false;
			}
		}
		
		for (const [index, videoData] of data.entries()) {
			const button = document.createElement('button');
			button.innerText = index + 1;
			button.videoData = videoData;
			button.hintAvailable = false;
			button.hintShown = false;
			button.currentHint = '';
			button.addEventListener('click', () => {
				if (isSecretVideoPlaying) {
					isSecretVideoPlaying = false;
				}
				
				SFXHandler(0, 'QuizBtn');
				video = videoData;
				
				if (button.classList.contains('correct-answer')) {
					videoPlayer.src = `QuizVideos/${video.ID}.webm`;
					videoPlayer.style.display = 'block';
				} else {
					videoPlayer.src = `QuizVideos/${video.ID}.webm`;
					videoPlayer.style.display = 'none';
				}
				
				answerInput.disabled = false;
				answerInput.value = '';
				answerFeedback.innerText = '';
				playPauseButton.innerText = 'Play';
				
				hintAvailable = button.hintAvailable;
				hintShown = button.hintShown;
				currentHint = button.currentHint;
				hintLabel.style.color = '#AAB4BE';
				
				if (hintAvailable && !hintShown) {
					hintLabel.innerText = 'Hint Available - Click here';
					hintLabel.addEventListener('click', showHint);
				} else if (hintShown) {
					hintLabel.innerText = `Hint: ${currentHint}`;
				} else {
					hintLabel.innerText = '';
					hintLabel.removeEventListener('click', showHint);
				}
				
				const buttons = document.querySelectorAll('#button-grid button');
				for (const button of buttons) {
					if (!button.classList.contains('correct-answer')) {
						button.classList.remove('selected');
						button.classList.remove('selected-correct-answer');
					}
				}
				
				if (!button.classList.contains('correct-answer')) {
					button.classList.add('selected');
				}
				currentSelectedButton = button;
				
				setTimeout(() => {
					videoPlayer.play();
					
					if (playPauseButton.innerText = 'Play') {
						playPauseButton.innerText = 'Pause';
					}
				}, 200);
			});
			videoButtons.appendChild(button);
		}
		
		playPauseButton.addEventListener('click', () => {
			if (videoPlayer.paused) {
				videoPlayer.play();
				playPauseButton.innerText = 'Pause';
			} else {
				videoPlayer.pause();
				playPauseButton.innerText = 'Play';
			}
		});
		
		rewindButton.addEventListener('click', () => {
			videoPlayer.currentTime = 0;
			videoPlayer.pause();
			playPauseButton.innerText = 'Play';
		});
		
		volumeSlider.addEventListener('input', () => {
			videoPlayer.volume = volumeSlider.value;
		});
		
		const hintLabel = document.getElementById('hint');
		let hintTimer;
		
		videoPlayer.addEventListener('timeupdate', () => {
			const halfDuration = videoPlayer.duration / 2;
			if (videoPlayer.currentTime > halfDuration && !hintAvailable && !hintShown && !isSecretVideoPlaying) {
				hintAvailable = true;
				const buttons = document.querySelectorAll('#button-grid button');
				for (const button of buttons) {
					if (button.videoData === video) {
						button.hintAvailable = true;
					}
				}
				
				clearInterval(hintTimer);
				hintLabel.innerText = 'Hint Available - Click here';
				hintLabel.style.color = '#AAB4BE';
				hintLabel.addEventListener('click', showHint);
			}
		});
		
		videoPlayer.addEventListener('play', () => {
			// Countdown timer for the hint
			hintTimer = setInterval(() => {
				if (!hintAvailable && !hintShown && !isSecretVideoPlaying) {
					const remainingTime = (videoPlayer.duration / 2) - videoPlayer.currentTime;
					hintLabel.innerText = `You can click here for the hint in ${Math.ceil(remainingTime)} seconds`;
					hintLabel.style.color = '#AAB4BE';
				} else {
					if (isSecretVideoPlaying) {
						hintLabel.innerText = '';
					}
					clearInterval(hintTimer);
				}
			}, 1000);
		});
		
		videoPlayer.addEventListener('pause', () => {
			clearInterval(hintTimer);
		});
		
		videoPlayer.addEventListener('ended', () => {
			if (!isSecretVideoPlaying) {
				videoPlayer.currentTime = 0;
				
				if (playPauseButton.innerText = 'Pause') {
					playPauseButton.innerText = 'Play';
				}
			} else {
				isSecretVideoPlaying = false; // Reset the flag when the secret video ends
				answerInput.disabled = false;
				videoPlayer.src = `QuizVideos/${video.ID}.webm`;
				videoPlayer.currentTime = 0;
				
				if (playPauseButton.innerText = 'Pause') {
					playPauseButton.innerText = 'Play';
				}
				
				if (!currentSelectedButton.classList.contains('correct-answer')) {
					videoPlayer.style.display = 'none';
				}
			}
		});
		
		function playSecretVideo(videoSrc) {
			isSecretVideoPlaying = true; // Set the flag indicating a secret video is playing
			answerInput.disabled = true;
			answerInput.value = '';
			videoPlayer.pause();
			
			answerFeedback.innerText = 'You\'ve found a secret!';
			answerFeedback.style.color = 'gold';
			SFXHandler(1, 'SecretAns');
			
			setTimeout(() => {
				videoPlayer.src = videoSrc;
				videoPlayer.style.display = 'block';
				videoPlayer.play();
			}, 3800);
			
			setTimeout(() => {
				answerFeedback.innerText = ''
			}, 7600);
		}
		
		// Updated showHint function
		function showHint() {
			if(!isSecretVideoPlaying) {
				if (!hintShown) {
					hintShown = true;
					currentHint = currentSelectedButton.videoData.Hint;
					
					hintLabel.innerText = `Hint: ${currentHint}`;
					hintLabel.style.color = '#AAB4BE';
					
					// Update the button's hintShown and currentHint properties
					if (currentSelectedButton) {
						currentSelectedButton.hintShown = true;
						currentSelectedButton.currentHint = currentHint;
						saveProgress();
					}
				}
			}
		}
		
		// Added code for secret video event listener
		answerInput.addEventListener('input', () => {
			const inputValue = answerInput.value.trim().toLowerCase();
			if (inputValue === 'jam on toast') {
				playSecretVideo('QuizVideos/PappiSecretSong.webm');
			}
		});
		
		loadProgress();
	});
});

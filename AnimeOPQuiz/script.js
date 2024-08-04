const videoPlayer = document.getElementById('video-player');

const videoButtons = document.getElementById('button-grid');
const answerInput = document.getElementById('answer-input');
const answerFeedback = document.getElementById('answer-feedback');

const playPauseButton = document.getElementById('play-pause-button');
const rewindButton = document.getElementById('rewind-button');
const volumeSlider = document.getElementById('volume-slider');

const clearDataButton = document.getElementById('clear-data-button');

function checkNumber(mText) {
	var sRegx = /[^a-zA-Z0-9]/g;
	var nRegx = /^[0-9]+$/;
	var sText = mText.replace(sRegx, '')
	
	if (nRegx.test(sText)) {
		return [true, sText];
	} else {
		return [false, sText];
	}
}

function prepMatch(mText) {
	return String(mText).replace(/[^0-9a-z]+/gi, '').toLowerCase();
}

function mkDistCurve(amount) {
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

let cNodes;
let dNodes;
let audCnt;
function hFirstCall(){
	audCnt = new (window.AudioContext || window.webkitAudioContext)();
	let srcNd = audCnt.createMediaElementSource(videoPlayer);
	let an1Nd = audCnt.createAnalyser();
	let pG1Nd = audCnt.createGain();
	let mG1Nd = audCnt.createGain();
	let disNd = audCnt.createWaveShaper();
	let mG2Nd = audCnt.createGain();
	let fl1Nd = audCnt.createBiquadFilter();
	let btCNd = audCnt.createScriptProcessor(4096, 1, 1);
	let fl2Nd = audCnt.createBiquadFilter();
	let an2Nd = audCnt.createAnalyser();
	let pG2Nd = audCnt.createGain();
	
	cNodes = [srcNd, an1Nd, pG1Nd];
	dNodes = [srcNd, mG1Nd, disNd, mG2Nd, fl1Nd, btCNd, fl2Nd, an2Nd, pG2Nd];
	
	const bDepth = 4;
	const gVals = [1.6, 0.8];
	
	dNodes[1].gain.value = gVals[0];
	dNodes[2].curve = mkDistCurve(2000);
	dNodes[3].gain.value = gVals[1];
	dNodes[4].type = 'lowpass';
	dNodes[4].frequency.value = 200;
	dNodes[5].onaudioprocess = function (e) {
		var iBff = e.inputBuffer.getChannelData(0);
		var oBff = e.outputBuffer.getChannelData(0);
		for (var i = 0; i < iBff.length; i++) {
			var step = Math.pow(1 / 2, bDepth);
			oBff[i] = Math.round(iBff[i] / step) * step;
		}
	};
	dNodes[6].type = 'lowpass';
	dNodes[6].frequency.value = 200; 
	
	monitorAudioLevelsA();
	monitorAudioLevelsB();
	
	document.removeEventListener('click', hFirstCall);
}

function monitorAudioLevelsA() {
	cNodes[1].fftSize = 2048;
	
	const freqData = new Uint8Array(cNodes[1].frequencyBinCount);
	
	cNodes[1].getByteFrequencyData(freqData);
	
	let sum = 0;
	for (let i = 0; i < freqData.length; i++) {
		sum += freqData[i];
	}
	
	const dBLevel = 20 * Math.log10(sum / freqData.length);
	
	const maxDBThreshold = 25;
	const maxGain = 0.8;
	const desGain = Math.pow(10, (maxDBThreshold - dBLevel) / 20);
	
	cNodes[2].gain.value = dBLevel > maxDBThreshold ? Math.min(desGain, maxGain) : maxGain;
	
	requestAnimationFrame(monitorAudioLevelsA);
}

function monitorAudioLevelsB() {
	dNodes[7].fftSize = 2048;
	
	const freqData = new Uint8Array(dNodes[7].frequencyBinCount);
	
	dNodes[7].getByteFrequencyData(freqData);
	
	let sum = 0;
	for (let i = 0; i < freqData.length; i++) {
		sum += freqData[i];
	}
	
	const dBLevel = 20 * Math.log10(sum / freqData.length);
	
	const maxDBThreshold = 20;
	const maxGain = 0.8;
	const desGain = Math.pow(10, (maxDBThreshold - dBLevel) / 20);
	
	dNodes[8].gain.value = dBLevel > maxDBThreshold ? Math.min(desGain, maxGain) : maxGain;
	
	requestAnimationFrame(monitorAudioLevelsA);
}

document.addEventListener('click', hFirstCall);
document.addEventListener('mouseup', handleMouseUp);

function handleMouseUp(event) {
	if (!answerInput.disabled) {
		answerInput.focus();
	}
}

videoPlayer.src = 'QuizVideos/Welcome.webm';

fetch('quiz-data.json')
.then(response => response.json())
.then(data => {
	fetch('mute_intervals.json')
	.then((response) => response.json())
	.then((muteIntervals) => {
		const hintLabel = document.getElementById('hint');
		let curSelButton = null;
		let hintTimer;
		let hintTimerActive = false;
		let isSecretPlay = false;
		let sHint;
		let sRemaining;
		let sVideos = [
			{'sW': 'Ayaya', 'sI': 'SecretAyaya', 'sH': 'What\'s the secret word that makes \'Kin-iro Mosaic\' characters giggle in unison? You got it, ______'},
			{'sW': 'Opening', 'sI': 'SecretOpening', 'sH': 'In the grand anime playlist, this keyword is the curtain-raiser to the show\'s musical masterpiece.'},
			{'sW': 'Sanji', 'sI': 'SecretSanji', 'sH': 'In the world of culinary martial arts, he\'s the master of both the kitchen and the dojo.'},
			{'sW': 'Soup', 'sI': 'SecretSoup', 'sH': 'In a land where garments meet gastronomy, two friends embark on a shopping trip that leads to culinary confusion.'},
			{'sW': 'Trap', 'sI': 'SecretTrap', 'sH': 'In the realm of appearance versus reality, this keyword refers to a character whose gender identity might lead you astray.'},
			{'sW': 'Vampire', 'sI': 'SecretVampire', 'sH': 'Certain fictional duos might have caught your attention, but they lack the classic characteristics that define a certain nocturnal archetype.'}
		]
		let sVideosBuffer;
		let currentHint = '';
		let hintAvailable = false;
		let hintShown = false;
		
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
		
		function getRandomIndex(iArr) {
			if (Array.isArray(iArr)) {
				const mIndex = iArr.length - 1;
				const rIndex = Math.floor(Math.random() * (mIndex + 1));
				return rIndex;
			} else {
				return false;
			}
		}
		
		function shuffleArray(iArr) {
			if (Array.isArray(iArr)) {
				let cIndex = iArr.length, rIndex;
				
				while (cIndex != 0) {
					rIndex = Math.floor(Math.random() * cIndex);
					cIndex--;
					
					[iArr[cIndex], iArr[rIndex]] = [
					iArr[rIndex], iArr[cIndex]];
				}
				
				return iArr;
			} else {
				return false;
			}
		}
		
		setInterval(function() {
			playPauseButton.innerText = (videoPlayer.paused) ? 'Play' : 'Pause';
		}, 100);
		
		setInterval(function() {
			if (!hintTimerActive) {
				if (!isSecretPlay) {
					if (hintAvailable && !hintShown) {
						hintLabel.innerText = 'Hint Available - Click here';
						hintLabel.addEventListener('click', showHint);
					} else if (hintShown) {
						hintLabel.innerText = `Hint: ${currentHint}`;
					} else {
						hintLabel.innerText = '';
						hintLabel.removeEventListener('click', showHint);
					}
				}
			}
		}, 100);
		
		function checkAnswer() {
			const inputValue = prepMatch(answerInput.value);
			let isMatch = false;
			let isSecret = false;
			let sID;
			
			isSecret = sVideos.some(({sW, sI}, i) => {
				if (new RegExp(`(${prepMatch(sW)})`).test(inputValue)) {
					sVideos[i].sG = true;
					sID = sI;
					saveProgress();
					return true;
				}
			});
			
			if (!isSecret && video.Keywords.some(keyword => new RegExp(`(${prepMatch(keyword)})`).test(inputValue))) {
				isMatch = true;
			}
			
			if (isMatch && !curSelButton.classList.contains('correct-answer')) {
				sRemaining = 0;
				sVideosBuffer = [];
				
				sVideos.forEach(({sG, sH}) => {
					if (!sG) {
						sVideosBuffer.push(sH);
						sRemaining++;
					}
				});
				
				if (sRemaining > 0) {
					if (sRemaining > 1) {
						shuffleArray(sVideosBuffer);
					}
					
					sHint = sVideosBuffer[getRandomIndex(sVideosBuffer)];
				}
				
				answerFeedback.innerText = `Correct! The Anime was ${video.Name}${sRemaining > 0 ? `! ...Secret Hint: ${sHint}` : '!'}`;
				answerFeedback.style.color = 'green';
				answerInput.value = '';
				videoPlayer.style.display = 'block';
				videoPlayer.play();
				
				curSelButton.classList.add('correct-answer');
				curSelButton.style.backgroundColor = 'green';
				curSelButton.innerText = curSelButton.videoData.Name;
				SFXHandler(1, 'RightAns');
				
				[curSelButton.hintAvailable, hintAvailable] = [true, true];
				saveProgress();
				
				//videoPlayer.classList.remove('hidden-video');
				videoPlayer.currentTime = 0;
				videoPlayer.play();
			} else {
				if (isSecret) {
					isSecretPlay = true;
					answerInput.disabled = true;
					answerInput.value = '';
					videoPlayer.pause();
					
					answerFeedback.innerText = 'You\'ve found a secret!';
					answerFeedback.style.color = 'gold';
					SFXHandler(1, 'SecretAns');
					
					setTimeout(() => {
						if (isSecretPlay) {
							videoPlayer.src = `QuizVideos/${sID}.webm`;
							videoPlayer.style.display = 'block';
							videoPlayer.style.objectFit = 'contain'
							videoPlayer.play();
						}
					}, 3800);
					
					setTimeout(() => {
						if (isSecretPlay) {
							answerFeedback.innerText = ''
						}
					}, 7600);
				}
			}
		}
		
		function saveProgress() {
			const progress = Array.from(document.querySelectorAll('#button-grid button')).map(button => {
				const buttonData = {
					id: button.videoData.ID,
					hintAvailable: button.hintAvailable,
					hintShown: button.hintShown,
					currentHint: button.currentHint,
					isCorrect: button.classList.contains('correct-answer')
				};
				return buttonData;
			});
			
			sVideos.forEach(sVideo => {
				progress.push({
					id: sVideo.sI,
					guess: sVideo.sG
				});
			});
			
			localStorage.setItem('AnimequizProgress', JSON.stringify(progress));
		}
		
		function loadProgress() {
			const savedProgress = localStorage.getItem('KidquizProgress');
			
			if (savedProgress) {
				const progress = JSON.parse(savedProgress);
				const buttons = document.querySelectorAll('#button-grid button');
				
				buttons.forEach(button => {
					const buttonData = progress.find(data => data.id === button.videoData.ID);
					
					if (buttonData) {
						button.classList.toggle('correct-answer', buttonData.isCorrect);
						button.style.backgroundColor = buttonData.isCorrect ? 'green' : button.style.backgroundColor;
						button.innerText = buttonData.isCorrect ? button.videoData.Name : button.innerText;
						button.hintAvailable = buttonData.hintAvailable;
						button.hintShown = buttonData.hintShown;
						button.currentHint = buttonData.currentHint;
					}
				});
				
				sVideos.forEach(sVideo => {
					const sVideoData = progress.find(data => data.id === sVideo.sI);
					
					if (sVideoData) {
						sVideo.sG = sVideoData.guess;
					}
				});
			}
		}
		
		clearDataButton.addEventListener('click', () => {
			localStorage.removeItem('KidquizProgress');
			location.reload();
		});
		
		videoPlayer.addEventListener('timeupdate', () => {
			const isWelcomeVideo = /(Welcome)/.test(videoPlayer.currentSrc);
			
			if ((!isWelcomeVideo && !curSelButton.classList.contains('correct-answer') && shouldDistVideo(video.ID, videoPlayer.currentTime)) || (isWelcomeVideo && shouldDistVideo('Welcome', videoPlayer.currentTime))) {
				if (!cNodes[0].isConnected || cNodes[0].numberOfOutputs === 0) {
					[...cNodes].reverse().forEach(node => node.disconnect());
					
					dNodes.forEach((node, index) => {
						const nextNode = index < dNodes.length - 1 ? dNodes[index + 1] : audCnt.destination;
						node.connect(nextNode);
					});
				}
			} else {
				if (cNodes[0].isConnected || cNodes[0].numberOfOutputs > 0) {
					[...dNodes].reverse().forEach(node => node.disconnect());
					
					cNodes.forEach((node, index) => {
						const nextNode = index < cNodes.length - 1 ? cNodes[index + 1] : audCnt.destination;
						node.connect(nextNode);
					});
				}
			}
		});
		
		function shouldDistVideo(videoID, cTime) {
			if (isSecretPlay || muteIntervals[videoID] === undefined) {
				return false;
			}
			
			const intervals = muteIntervals[videoID];
			return intervals.some(interval => cTime >= interval.start && cTime <= interval.end);
		}
		
		for (const [index, videoData] of data.entries()) {
			const button = document.createElement('button');
			button.innerText = index + 1;
			button.videoData = videoData;
			button.hintAvailable = false;
			button.hintShown = false;
			button.currentHint = '';
			button.addEventListener('click', () => {
				curSelButton = button;
				
				if (isSecretPlay) {
					isSecretPlay = false;
				}
				
				SFXHandler(0, 'QuizBtn');
				video = videoData;
				
				videoPlayer.currentTime = videoData.StartTime;

				videoPlayer.src = `QuizVideos/${video.ID}.webm`;
				videoPlayer.style.display = button.classList.contains('correct-answer') ? 'block' : 'none';

				videoPlayer.pause();
				
				answerInput.disabled = false;
				answerInput.value = '';
				answerFeedback.innerText = '';
				
				hintAvailable = button.hintAvailable;
				hintShown = button.hintShown;
				currentHint = button.currentHint;
				hintLabel.style.color = '#AAB4BE';
				
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
				
				setTimeout(() => {
					videoPlayer.play();
				}, 200);
			});
			videoButtons.appendChild(button);
		}
		
		playPauseButton.addEventListener('click', () => {
			if (videoPlayer.paused) {
				videoPlayer.play();
			} else {
				videoPlayer.pause();
			}
		});
		
		rewindButton.addEventListener('click', () => {
			videoPlayer.pause();
			videoPlayer.currentTime = 0;
		});
		
		volumeSlider.addEventListener('input', () => {
			videoPlayer.volume = volumeSlider.value;
		});
		
		videoPlayer.addEventListener('timeupdate', () => {
			const isWelcomeVideo = /(Welcome)/.test(videoPlayer.currentSrc);
			
			if (!isWelcomeVideo) {
				const halfDuration = videoPlayer.duration / 2;
				
				if (videoPlayer.currentTime > halfDuration && !hintAvailable && !hintShown && !isSecretPlay) {
					[curSelButton.hintAvailable, hintAvailable] = [true, true];
					clearInterval(hintTimer);
					saveProgress();
					hintTimerActive = false;
				}
			}
		});
		
		videoPlayer.addEventListener('play', () => {
			hintTimer = setInterval(() => {
				const isWelcomeVideo = /(Welcome)/.test(videoPlayer.currentSrc);
				
				if (isSecretPlay || isWelcomeVideo) {
					hintLabel.innerText = '';
					clearInterval(hintTimer);
					hintTimerActive = false;
				} else {
					hintTimerActive = true;
					if (!hintAvailable && !hintShown) {
						const remainingTime = Math.ceil((videoPlayer.duration / 2) - videoPlayer.currentTime);
						hintLabel.innerText = `You can click here for the hint in ${remainingTime} seconds`;
						hintLabel.style.color = '#AAB4BE';
					} else {
						clearInterval(hintTimer);
						hintTimerActive = false;
					}
				}
			}, 1000);
		});
		
		videoPlayer.addEventListener('pause', () => {
			clearInterval(hintTimer);
		});
		
		videoPlayer.addEventListener('ended', () => {
			if (isSecretPlay) {
				isSecretPlay = false;
				answerInput.disabled = false;
				videoPlayer.src = `QuizVideos/${video.ID}.webm`;
				videoPlayer.style.display = curSelButton.classList.contains('correct-answer') ? 'block' : 'none';
				videoPlayer.style.objectFit = 'fill'
			}
			
			videoPlayer.currentTime = 0;
		});
		
		function showHint() {
			if(!isSecretPlay) {
				if (!hintShown) {
					hintShown = true;
					currentHint = curSelButton.videoData.Hint;

					hintLabel.innerText = `Hint: ${currentHint}`;
					hintLabel.style.color = '#AAB4BE';
					
					if (curSelButton) {
						curSelButton.hintShown = true;
						curSelButton.currentHint = currentHint;
						saveProgress();
					}
				}
			}
		}
		
		loadProgress();
	});
});

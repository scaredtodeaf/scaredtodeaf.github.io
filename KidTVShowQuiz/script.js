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

let cleanNodes;
let dirtyNodes;
let audCnt;
function hFirstCall(){
	audCnt = new (window.AudioContext || window.webkitAudioContext)();
	let srceNd = audCnt.createMediaElementSource(videoPlayer);
	let anl1Nd = audCnt.createAnalyser();
	let prG1Nd = audCnt.createGain();
	
	let mfG1Nd = audCnt.createGain();
	let distNd = audCnt.createWaveShaper();
	let mfG2Nd = audCnt.createGain();
	let fil1Nd = audCnt.createBiquadFilter();
	let bitCNd = audCnt.createScriptProcessor(4096, 1, 1);
	let fil2Nd = audCnt.createBiquadFilter();
	let anl2Nd = audCnt.createAnalyser();
	let prG2Nd = audCnt.createGain();
	
	cleanNodes = [srceNd, anl1Nd, prG1Nd];
	dirtyNodes = [srceNd, mfG1Nd, distNd, mfG2Nd, fil1Nd, bitCNd, fil2Nd, anl2Nd, prG2Nd];
	
	const bitDepth = 4;
	const gainVals = [1.6, 0.8];
	
	dirtyNodes[1].gain.value = gainVals[0];
	dirtyNodes[2].curve = mkDistCurve(2000);
	dirtyNodes[3].gain.value = gainVals[1];
	dirtyNodes[4].type = 'lowpass';
	dirtyNodes[4].frequency.value = 200;
	dirtyNodes[5].onaudioprocess = function (e) {
		var iBuffer = e.inputBuffer.getChannelData(0);
		var oBuffer = e.outputBuffer.getChannelData(0);
		for (var i = 0; i < iBuffer.length; i++) {
			var step = Math.pow(1 / 2, bitDepth);
			oBuffer[i] = Math.round(iBuffer[i] / step) * step;
		}
	};
	dirtyNodes[6].type = 'lowpass';
	dirtyNodes[6].frequency.value = 200; 
	
	monitorAudioLevelsA();
	monitorAudioLevelsB();
	
	document.removeEventListener("click", hFirstCall);
}

function monitorAudioLevelsA() {
	cleanNodes[1].fftSize = 2048;
	
	const freqData = new Uint8Array(cleanNodes[1].frequencyBinCount);
	
	cleanNodes[1].getByteFrequencyData(freqData);
	
	let sum = 0;
	for (let i = 0; i < freqData.length; i++) {
		sum += freqData[i];
	}
	
	const avgLevel = sum / freqData.length;
	const dBLevel = 20 * Math.log10(avgLevel);
	
	const maxDBThreshold = 20;
	const maxGain = 0.8;
	
	if (dBLevel > maxDBThreshold) {
		const desiredGain = Math.pow(10, (maxDBThreshold - dBLevel) / 20);
		cleanNodes[2].gain.value = Math.min(desiredGain, maxGain);
	} else {
		cleanNodes[2].gain.value = maxGain;
	}
	
	requestAnimationFrame(monitorAudioLevelsA);
}

function monitorAudioLevelsB() {
	dirtyNodes[7].fftSize = 2048;
	
	const freqData = new Uint8Array(dirtyNodes[7].frequencyBinCount);
	
	dirtyNodes[7].getByteFrequencyData(freqData);
	
	let sum = 0;
	for (let i = 0; i < freqData.length; i++) {
		sum += freqData[i];
	}
	
	const avgLevel = sum / freqData.length;
	const dBLevel = 20 * Math.log10(avgLevel);
	
	const maxDBThreshold = 20;
	const maxGain = 0.8;
	
	if (dBLevel > maxDBThreshold) {
		const desiredGain = Math.pow(10, (maxDBThreshold - dBLevel) / 20);
		dirtyNodes[8].gain.value = Math.min(desiredGain, maxGain);
	} else {
		dirtyNodes[8].gain.value = maxGain;
	}
	
	requestAnimationFrame(monitorAudioLevelsA);
}

document.addEventListener("click", hFirstCall);

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
		let isSecretVideoPlaying = false;
		let sHint;
		let sRemaining;
		let sVideos = [
			{'sWord': 'Jam on Toast', 'sID': 'PappiSecretSong', 'sHint': 'It\'s Jamie\'s favourite breakfast treat!', 'sGuessed': false},
			{'sWord': 'Battletoads', 'sID': 'SecretBattletoad', 'sHint': 'Dive into retro chaos, where pixelated amphibians conquer the Nintendo realm.', 'sGuessed': false},
			{'sWord': 'Graham', 'sID': 'SecretBear', 'sHint': 'A cracker which shares its name with a King\'s Quest character!', 'sGuessed': false},
			{'sWord': 'Big Kev', 'sID': 'SecretBigKev', 'sHint': 'Expect the unexpected when a larger-than-life personality sells YOU products!', 'sGuessed': false},
			{'sWord': 'Bob', 'sID': 'SecretBob', 'sHint': 'If you want some construction work done, he\'s who you call!', 'sGuessed': false},
			{'sWord': 'Wendy', 'sID': 'SecretBurger', 'sHint': 'Does she deliver the best burgers around?!', 'sGuessed': false},
			{'sWord': 'Cheetos', 'sID': 'SecretCheetos', 'sHint': 'The irresistible crunch that leaves you with cheesy fingers and a craving for more.', 'sGuessed': false},
			{'sWord': 'Chex', 'sID': 'SecretChex', 'sHint': 'Gear up, cereal warrior, and vanquish hunger\'s alien invasion. Now with a free CD!', 'sGuessed': false},
			{'sWord': 'Starburst', 'sID': 'SecretCream', 'sHint': 'Taste the explosive burst of fruity supernovas in every chew.', 'sGuessed': false},
			{'sWord': 'Chocolate', 'sID': 'SecretDime', 'sHint': 'Savor the velvety bliss born from the depths of nature\'s confectionery.', 'sGuessed': false},
			{'sWord': 'Jingle Bells', 'sID': 'SecretDoor', 'sHint': 'Joyful notes chime, riding in a winter wonderland.', 'sGuessed': false},
			{'sWord': 'Drugs', 'sID': 'SecretDrugs', 'sHint': 'It all originated from a TV Campaign! This is your brain on...', 'sGuessed': false},
			{'sWord': 'Duracell', 'sID': 'SecretDuracell', 'sHint': 'It\'s the battery that lasts, apparently!', 'sGuessed': false},
			{'sWord': 'Fisher', 'sID': 'SecretFisher', 'sHint': 'The architects of childhood wonder, crafting toys that ignite imagination and foster endless adventures.', 'sGuessed': false},
			{'sWord': 'Cigar', 'sID': 'SecretHamlet', 'sHint': 'Smoke swirls, shadows deepen... A moment frozen in cinematic allure.', 'sGuessed': false},
			{'sWord': 'Road Rage', 'sID': 'SecretIdiot', 'sHint': 'The tempestuous symphony of honks, screeches and choice words, where patience meets its highway nemesis.', 'sGuessed': false},
			{'sWord': 'Jan', 'sID': 'SecretJan', 'sHint': 'When the year bows out, and resolutions begin anew, the shorthand for this month plays its cue.', 'sGuessed': false},
			{'sWord': 'KFC', 'sID': 'SecretKFC', 'sHint': 'The culinary legend that tantalizes taste buds with a blend of tantalizing herbs and flavors.', 'sGuessed': false},
			{'sWord': 'McDonalds', 'sID': 'SecretMaccas', 'sHint': 'You can get all these delicious items for a DOLLAR here?!', 'sGuessed': false},
			{'sWord': 'Milk', 'sID': 'SecretMilk', 'sHint': 'Got cookies? It\'s got your back... Unless you\'re intolerant!', 'sGuessed': false},
			{'sWord': 'Myst', 'sID': 'SecretMyst', 'sHint': 'Dive into the pages of an enigmatic tome, where imagination weaves intricate riddles and mysteries unfold.', 'sGuessed': false},
			{'sWord': 'Orange', 'sID': 'SecretOrange', 'sHint': 'In the citrus battleground, one fruit\'s vibrant crown shines brightest, leaving its sour compatriots facing a tangy defeat!', 'sGuessed': false},
			{'sWord': 'Peperami', 'sID': 'SecretPeperami', 'sHint': 'The carnivorous delight that satisfies your cravings with meaty zeal and a spicy kick.', 'sGuessed': false},
			{'sWord': 'Pepsiman', 'sID': 'SecretPepsi', 'sHint': 'Unleash your inner hero with a carbonated champion that empowers your every sip!', 'sGuessed': false},
			{'sWord': 'Pitfall', 'sID': 'SecretPitfall', 'sHint': 'Unearth ancient hazards and test your mettle in a classic quest of hazards and rewards.', 'sGuessed': false},
			{'sWord': 'Pikachu', 'sID': 'SecretPokemon', 'sHint': 'This character often comes top in \'Pocket Monster\' polls.', 'sGuessed': false},
			{'sWord': 'Salmon', 'sID': 'SecretSalmon', 'sHint': 'The piscine monarch of the bagel realms, ruling over every delectable bite.', 'sGuessed': false},
			{'sWord': 'Samboy', 'sID': 'SecretSamboy', 'sHint': 'Embrace the crunch that packs a flavor punch like no other.', 'sGuessed': false},
			{'sWord': 'Shreddies', 'sID': 'SecretShreddies', 'sHint': 'It\'s the only cereal that\'s \'knitted\'!', 'sGuessed': false},
			{'sWord': 'Smash', 'sID': 'SecretSmash', 'sHint': 'What does Nintendo and Instant Mashed Potato have in common?!', 'sGuessed': false},
			{'sWord': 'Mint', 'sID': 'SecretSoft', 'sHint': 'The cool breeze of flavor that sweeps through your palate, leaving a refreshing trail behind.', 'sGuessed': false},
			{'sWord': 'Sega', 'sID': 'SecretSonic', 'sHint': 'Nintendo\'s arch rivals in the gaming industry, for a while.', 'sGuessed': false},
			{'sWord': 'Water', 'sID': 'SecretSoaker', 'sHint': 'You want it, you need it? H20 has got it!', 'sGuessed': false},
			{'sWord': 'Sprite', 'sID': 'SecretSprite', 'sHint': 'Quench your thirst with a sparkling sprite of citrus delight.', 'sGuessed': false},
			{'sWord': 'Tetris', 'sID': 'SecretTetris', 'sHint': 'Enter a world where order and chaos collide, governed by your strategic moves.', 'sGuessed': false},
			{'sWord': 'Twix', 'sID': 'SecretTwix', 'sHint': 'Double the pleasure, twice the caramel-coated treasure.', 'sGuessed': false},
			{'sWord': 'Vegemite', 'sID': 'SecretVegemite', 'sHint': 'The bold essence of Down Under, spreading its savory magic with an acquired taste.', 'sGuessed': false},
			{'sWord': 'Mickey Mouse', 'sID': 'SecretYazhee', 'sHint': 'This character fronted a big-name studio\'s first foray into animation!', 'sGuessed': false},
			{'sWord': 'Yogurt', 'sID': 'SecretYop', 'sHint': 'Milk\'s rebellious sibling: It\'s milk gone wild... IT\'S ALIVE!!!', 'sGuessed': false},
			{'sWord': 'Zelda', 'sID': 'SecretZelda', 'sHint': 'Courage, a green tunic, and a legendary quest await.', 'sGuessed': false}
		];
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
				let cIndex = iArr.length,  rIndex;
				
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
		
		function checkAnswer() {
			const inputValue = prepMatch(answerInput.value);
			let isMatch = false;
			let isSecret = false;
			let sID;
			
			for (let i = 0; i < sVideos.length; i++) {
				const matchRegex = new RegExp(`(${prepMatch(sVideos[i].sWord)})`);
				
				if (matchRegex.test(inputValue)) {
					isSecret = true;
					sVideos[i].sGuessed = true;
					sID = sVideos[i].sID;
					saveProgress();
					break;
				}
			}
			
			if (!isSecret) {
				for (const keyword of video.Keywords) {
					const matchRegex = new RegExp(`(${prepMatch(keyword)})`);
					
					if (matchRegex.test(inputValue)) {
						isMatch = true;
						break;
					}
				}
			}
			
			if (isMatch && !curSelButton.classList.contains('correct-answer')) {
				sRemaining = 0;
				sVideosBuffer = [];
				
				for (let i = 0; i < sVideos.length; i++) {
					if (sVideos[i].sGuessed === false) {
						sVideosBuffer.push(sVideos[i].sHint);
						sRemaining += 1;
					}
				}
				
				if (sRemaining > 0) {
					if (sRemaining > 1) {
						sVideosBuffer = shuffleArray(sVideosBuffer);
					}
					
					var sIndex = getRandomIndex(sVideosBuffer);
					sHint = sVideosBuffer[sIndex];
					answerFeedback.innerText = `Correct! The TV Show was ${video.Name}! ...Secret Hint: ${sHint}`;
				} else {
					answerFeedback.innerText = `Correct! The TV Show was ${video.Name}!`;
				}
				
				answerFeedback.style.color = 'green';
				answerInput.value = '';
				videoPlayer.style.display = 'block';
				videoPlayer.play();
				
				curSelButton.classList.add('correct-answer');
				curSelButton.style.backgroundColor = 'green';
				curSelButton.innerText = curSelButton.videoData.Name;
				SFXHandler(1, 'RightAns');
				
				curSelButton.hintAvailable = true;
				hintAvailable = curSelButton.hintAvailable;
				saveProgress();
				
				if (hintAvailable && !hintShown) {
					hintLabel.innerText = 'Hint Available - Click here';
					hintLabel.addEventListener('click', showHint);
				} else if (hintShown) {
					hintLabel.innerText = `Hint: ${currentHint}`;
				} else {
					hintLabel.innerText = '';
					hintLabel.removeEventListener('click', showHint);
				}
				
				videoPlayer.classList.remove('hidden-video');
				videoPlayer.currentTime = 0;
				videoPlayer.play();
			} else {
				if (isSecret) {
					isSecretVideoPlaying = true;
					answerInput.disabled = true;
					answerInput.value = '';
					videoPlayer.pause();
					
					answerFeedback.innerText = 'You\'ve found a secret!';
					answerFeedback.style.color = 'gold';
					SFXHandler(1, 'SecretAns');
					
					setTimeout(() => {
						if (isSecretVideoPlaying) {
							videoPlayer.src = `QuizVideos/${sID}.webm`;
							videoPlayer.style.display = 'block';
							videoPlayer.play();
						}
					}, 3800);
					
					setTimeout(() => {
						if (isSecretVideoPlaying) {
							answerFeedback.innerText = ''
						}
					}, 7600);
				}
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
			
			for (const sVideo of sVideos) {
				progress.push({
					id: sVideo.sID,
					guessed: sVideo.sGuessed
				});
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
				
				for (let i = 0; i < sVideos.length; i++) {
				}
				
				
				for (const sVideo of sVideos) {
					const sVideoData = progress.find((data) => data.id === sVideo.sID);
					
					if (sVideoData) {
						sVideo.sGuessed = sVideoData.guessed;
					}
				}
			}
		}
		
		clearDataButton.addEventListener('click', () => {
			localStorage.removeItem('KidquizProgress');
			location.reload();
		});
		
		videoPlayer.addEventListener('timeupdate', () => {
			const matchRegex = new RegExp('(Welcome)');
			if (!matchRegex.test(videoPlayer.currentSrc)) {
				if (!curSelButton.classList.contains('correct-answer') && shouldDistVideo(video.ID, videoPlayer.currentTime)) {
					if (cleanNodes[0].isConnected || cleanNodes[0].numberOfOutputs > 0) {
						for (let i = (cleanNodes.length - 1); i >= 0; i--) {
							cleanNodes[i].disconnect();
						}
						
						dirtyNodes.forEach((node, index) => {
							if (index < dirtyNodes.length - 1) {
								node.connect(dirtyNodes[index + 1]);
							} else {
								node.connect(audCnt.destination);
							}
						});
					}
				} else {
					if (!cleanNodes[0].isConnected || cleanNodes[0].numberOfOutputs === 0) {
						for (let i = (dirtyNodes.length - 1); i >= 0; i--) {
							dirtyNodes[i].disconnect();
						}
						
						cleanNodes.forEach((node, index) => {
							if (index < cleanNodes.length - 1) {
								node.connect(cleanNodes[index + 1]);
							} else {
								node.connect(audCnt.destination);
							}
						});
					}
				}
			} else {
				if (shouldDistVideo('Welcome', videoPlayer.currentTime)) {
					if (cleanNodes[0].isConnected || cleanNodes[0].numberOfOutputs > 0) {
						for (let i = (cleanNodes.length - 1); i >= 0; i--) {
							cleanNodes[i].disconnect();
						}
						
						dirtyNodes.forEach((node, index) => {
							if (index < dirtyNodes.length - 1) {
								node.connect(dirtyNodes[index + 1]);
							} else {
								node.connect(audCnt.destination);
							}
						});
					}
				} else {
					if (!cleanNodes[0].isConnected || cleanNodes[0].numberOfOutputs === 0) {
						for (let i = (dirtyNodes.length - 1); i >= 0; i--) {
							dirtyNodes[i].disconnect();
						}
						
						cleanNodes.forEach((node, index) => {
							if (index < cleanNodes.length - 1) {
								node.connect(cleanNodes[index + 1]);
							} else {
								node.connect(audCnt.destination);
							}
						});
					}
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
				curSelButton = button;
				
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
			
			if (playPauseButton.innerText = 'Pause') {
				playPauseButton.innerText = 'Play';
			}
		});
		
		volumeSlider.addEventListener('input', () => {
			videoPlayer.volume = volumeSlider.value;
		});
		
		videoPlayer.addEventListener('timeupdate', () => {
			const matchRegex = new RegExp('(Welcome)');
			
			if (!matchRegex.test(videoPlayer.currentSrc)) {
				const halfDuration = videoPlayer.duration / 2;
				if (videoPlayer.currentTime > halfDuration && !hintAvailable && !hintShown && !isSecretVideoPlaying) {
					curSelButton.hintAvailable, hintAvailable = true;
					
					clearInterval(hintTimer);
					hintLabel.innerText = 'Hint Available - Click here';
					hintLabel.style.color = '#AAB4BE';
					hintLabel.addEventListener('click', showHint);
				}
			}
		});
		
		videoPlayer.addEventListener('play', () => {
			hintTimer = setInterval(() => {
				const matchRegex = new RegExp('(Welcome)');
				
				if (isSecretVideoPlaying || matchRegex.test(videoPlayer.currentSrc)) {
					hintLabel.innerText = '';
					clearInterval(hintTimer);
				} else {
					if (!hintAvailable && !hintShown) {
						const remainingTime = (videoPlayer.duration / 2) - videoPlayer.currentTime;
						hintLabel.innerText = `You can click here for the hint in ${Math.ceil(remainingTime)} seconds`;
						hintLabel.style.color = '#AAB4BE';
					} else {
						clearInterval(hintTimer);
					}
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
				isSecretVideoPlaying = false;
				answerInput.disabled = false;
				videoPlayer.src = `QuizVideos/${video.ID}.webm`;
				videoPlayer.currentTime = 0;
				
				if (playPauseButton.innerText = 'Pause') {
					playPauseButton.innerText = 'Play';
				}
				
				if (!curSelButton.classList.contains('correct-answer')) {
					videoPlayer.style.display = 'none';
				}
			}
		});
		
		function showHint() {
			if(!isSecretVideoPlaying) {
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

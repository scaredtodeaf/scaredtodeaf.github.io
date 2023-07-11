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
	
	document.removeEventListener("click", hFirstCall);
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
		let hintTimerActive = false;
		let isSecretPlay = false;
		let sHint;
		let sRemaining;
		let sVideos = [
			{'sW': 'Jam on Toast', 'sI': 'PappiSecretSong', 'sH': 'Jamie LOVES this culinary masterpiece, that\'s worth waking up for!'},
			{'sW': 'Pool', 'sI': 'SecretBankshot', 'sH': 'Make a splash in an aquatic playground, where strokes and dives are the cue for waves of excitement.'},
			{'sW': 'Battletoads', 'sI': 'SecretBattletoads', 'sH': 'Dive into retro chaos, where pixelated amphibians conquer the Nintendo realm.'},
			{'sW': 'Graham', 'sI': 'SecretBear', 'sH': 'A cracker which shares its name with a King\'s Quest character!'},
			{'sW': 'Big Kev', 'sI': 'SecretBigKev', 'sH': 'Expect the unexpected when a larger-than-life personality sells YOU products!'},
			{'sW': 'Burger King', 'sI': 'SecretBK', 'sH': 'Have it your way at the home of flame-grilled masterpieces, where the King reigns supreme.'},
			{'sW': 'Blockbuster', 'sI': 'SecretBlockbuster', 'sH': 'Travel down memory lane to a once-mighty empire of movie rentals, now lost to the annals of nostalgia and digital streaming.'},
			{'sW': 'Bob', 'sI': 'SecretBob', 'sH': 'If you want some construction work done, he\'s who you call!'},
			{'sW': 'Wendy', 'sI': 'SecretBurger', 'sH': 'Does she deliver the best burgers around?!'},
			{'sW': 'Butterfinger', 'sI': 'SecretButterfingers', 'sH': 'Delight in a symphony of nutty richness and satisfying crunch where a velvety spread meets cornflake crumbs, for a taste sensation that\'s truly irresistible.'},
			{'sW': 'Cheetos', 'sI': 'SecretCheetos', 'sH': 'The irresistible crunch that leaves you with cheesy fingers and a craving for more.'},
			{'sW': 'Chex', 'sI': 'SecretChex', 'sH': 'Gear up, cereal warrior, and vanquish hunger\'s alien invasion. Now with a free CD!'},
			{'sW': 'Coffee', 'sI': 'SecretCoffee', 'sH': 'Savor the dark elixir that ignites the day, a steaming companion that embraces mornings and lingers on the lips, captivating with its aromatic allure.'},
			{'sW': 'Starburst', 'sI': 'SecretCream', 'sH': 'Taste the explosive burst of fruity supernovas in every chew.'},
			{'sW': 'Chocolate', 'sI': 'SecretDime', 'sH': 'Savor the velvety bliss born from the depths of nature\'s confectionery.'},
			{'sW': 'Jingle Bells', 'sI': 'SecretDoor', 'sH': 'Joyful notes chime, riding in a winter wonderland.'},
			{'sW': 'Drugs', 'sI': 'SecretDrugs', 'sH': 'It all originated from a TV Campaign! This is your brain on...'},
			{'sW': 'Dunkaroo', 'sI': 'SecretDunkaroos', 'sH': 'Embark on an outback escapade, where snack time takes a tantalizing twist that\'ll leave you hopping with delight with every dip n\' dunk!'},
			{'sW': 'Duracell', 'sI': 'SecretDuracell', 'sH': 'It\'s the battery that lasts, apparently!'},
			{'sW': 'Fisher', 'sI': 'SecretFisher', 'sH': 'The architects of childhood wonder, crafting toys that ignite imagination and foster endless adventures.'},
			{'sW': 'Football', 'sI': 'SecretFootball', 'sH': 'Kick off into a global frenzy where language divides people, but the love for the game brings them back together!'},
			{'sW': 'Cigar', 'sI': 'SecretHamlet', 'sH': 'Smoke swirls, shadows deepen... A moment frozen in cinematic allure.'},
			{'sW': 'Road Rage', 'sI': 'SecretIdiot', 'sH': 'The tempestuous symphony of honks, screeches and choice words, where patience meets its highway nemesis.'},
			{'sW': 'Jan', 'sI': 'SecretJan', 'sH': 'When the year bows out, and resolutions begin anew, the shorthand for this month plays its cue.'},
			{'sW': 'KFC', 'sI': 'SecretKFC', 'sH': 'The culinary legend that tantalizes taste buds with a blend of tantalizing herbs and flavors.'},
			{'sW': 'Lunchable', 'sI': 'SecretLunchables', 'sH': 'Embark on a journey to become the next best food architect, assembling and crafting flavorful combinations with every bite.'},
			{'sW': 'McDonalds', 'sI': 'SecretMaccas', 'sH': 'You can get all these delicious items for a DOLLAR here?!'},
			{'sW': 'Milk', 'sI': 'SecretMilk', 'sH': 'Got cookies? It\'s got your back... Unless you\'re intolerant!'},
			{'sW': 'Myst', 'sI': 'SecretMyst', 'sH': 'Dive into the pages of an enigmatic tome, where imagination weaves intricate riddles and mysteries unfold.'},
			{'sW': 'Orange', 'sI': 'SecretOrange', 'sH': 'In the citrus battleground, one fruit\'s vibrant crown shines brightest, leaving its sour compatriots facing a tangy defeat!'},
			{'sW': 'Peperami', 'sI': 'SecretPeperami', 'sH': 'The carnivorous delight that satisfies your cravings with meaty zeal and a spicy kick.'},
			{'sW': 'Pepsiman', 'sI': 'SecretPepsi', 'sH': 'Unleash your inner hero with a carbonated champion that empowers your every sip!'},
			{'sW': 'Pitfall', 'sI': 'SecretPitfall', 'sH': 'Unearth ancient hazards and test your mettle in a classic quest of hazards and rewards.'},
			{'sW': 'Pikachu', 'sI': 'SecretPokemon', 'sH': 'This character often comes top in \'Pocket Monster\' polls.'},
			{'sW': 'Pottery', 'sI': 'SecretPottery', 'sH': 'Experience the meditative art of shaping pliable earth into reality, where the hands breathe life into malleable substances and craft them into exquisite creations!'},
			{'sW': 'Salmon', 'sI': 'SecretSalmon', 'sH': 'The piscine monarch of the bagel realms, ruling over every delectable bite.'},
			{'sW': 'Samboy', 'sI': 'SecretSamboy', 'sH': 'Embrace the crunch that packs a flavor punch like no other.'},
			{'sW': 'Shreddies', 'sI': 'SecretShreddies', 'sH': 'It\'s the only cereal that\'s \'knitted\'!'},
			{'sW': 'Smash', 'sI': 'SecretSmash', 'sH': 'What does Nintendo and Instant Mashed Potato have in common?!'},
			{'sW': 'Mint', 'sI': 'SecretSoft', 'sH': 'The cool breeze of flavor that sweeps through your palate, leaving a refreshing trail behind.'},
			{'sW': 'Sega', 'sI': 'SecretSonic', 'sH': 'Nintendo\'s arch rivals in the gaming industry, for a while.'},
			{'sW': 'Water', 'sI': 'SecretSoaker', 'sH': 'You want it, you need it? H20 has got it!'},
			{'sW': 'Sprite', 'sI': 'SecretSprite', 'sH': 'Quench your thirst with a sparkling sprite of citrus delight.'},
			{'sW': 'Tetris', 'sI': 'SecretTetris', 'sH': 'Enter a world where order and chaos collide, governed by your strategic moves.'},
			{'sW': 'Toys', 'sI': 'SecretToys', 'sH': 'Little kids play with them, big kids play with them, and sometimes adults do too!'},
			{'sW': 'Twix', 'sI': 'SecretTwix', 'sH': 'Double the pleasure, twice the caramel-coated treasure.'},
			{'sW': 'Vegemite', 'sI': 'SecretVegemite', 'sH': 'The bold essence of Down Under, spreading its savory magic with an acquired taste.'},
			{'sW': 'Mickey Mouse', 'sI': 'SecretYazhee', 'sH': 'This character fronted a big-name studio\'s first foray into animation!'},
			{'sW': 'Yogurt', 'sI': 'SecretYop', 'sH': 'Milk\'s rebellious sibling: It\'s milk gone wild... IT\'S ALIVE!!!'},
			{'sW': 'Zelda', 'sI': 'SecretZelda', 'sH': 'Courage, a green tunic, and a legendary quest await.'}
		].map(video => ({ ...video, sG: false }));
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
		
		setInterval(function() {
			playPauseButton.innerText = (videoPlayer.paused) ? 'Play' : 'Pause';
		}, 100);
		
		setInterval(function() {
			if (!hintTimerActive) {
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
				
				answerFeedback.innerText = `Correct! The TV Show was ${video.Name}${sRemaining > 0 ? `! ...Secret Hint: ${sHint}` : '!'}`;
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
				
				videoPlayer.classList.remove('hidden-video');
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
			
			localStorage.setItem('KidquizProgress', JSON.stringify(progress));
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
				
				videoPlayer.src = `QuizVideos/${video.ID}.webm`;
				videoPlayer.style.display = button.classList.contains('correct-answer') ? 'block' : 'none';
				
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
					curSelButton.hintAvailable, hintAvailable = true;
					clearInterval(hintTimer);
					hintTimerActive = false;
					hintLabel.innerText = 'Hint Available - Click here';
					hintLabel.style.color = '#AAB4BE';
					hintLabel.addEventListener('click', showHint);
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

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
    answerFeedback.innerText = 'Incorrect.';
    answerFeedback.style.color = 'red';
    SFXHandler(1, 'WrongAns');
  }
});

answerInput.form.addEventListener('submit', (event) => {
  event.preventDefault();
});

function prepMatch(matchText) {
  return String(matchText).replace(/[^0-9a-z]+/gi, '').toLowerCase();
}



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
    answerFeedback.innerText = `Correct! The game was ${video.Name}!`;
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

fetch('quiz-data.json')
  .then(response => response.json())
  .then(data => {
    fetch('mute_intervals.json')
    .then((response) => response.json())
    .then((muteIntervals) => {
      videoPlayer.addEventListener('timeupdate', () => {
        if (!currentSelectedButton.classList.contains('correct-answer') && shouldMuteVideo(video.ID, videoPlayer.currentTime)) {
          videoPlayer.muted = true;
        } else {
          videoPlayer.muted = false;
        }
      });
      

      function shouldMuteVideo(videoID, currentTime) {
        const intervals = muteIntervals[videoID];
        for (const interval of intervals) {
          if (currentTime >= interval.start && currentTime <= interval.end) {
            return true;
          }
        }
        return false;
      }

    for (const [index, videoData] of data.entries()) {
        const button = document.createElement('button');
        button.innerText = index + 1;
        button.videoData = videoData;
        button.hintAvailable = false;
        button.hintShown = false;
        button.currentHint = '';
        button.addEventListener('click', () => {
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
      if (videoPlayer.currentTime > halfDuration && !hintAvailable && !hintShown) {
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
        if (!hintAvailable && !hintShown) {
          const remainingTime = (videoPlayer.duration / 2) - videoPlayer.currentTime;
          hintLabel.innerText = `You can click here for the hint in ${Math.ceil(remainingTime)} seconds`;
          hintLabel.style.color = '#AAB4BE';
        } else {
          clearInterval(hintTimer);
        }
      }, 1000);
    });

    videoPlayer.addEventListener('pause', () => {
      clearInterval(hintTimer);
    });

    // Function to show the hint
    function showHint() {
      if (!hintShown) {
        hintShown = true;
        currentHint = currentSelectedButton.videoData.Hint;
        clearInterval(hintTimer);
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
    
    
    



    // Added code for secret video event listener
    answerInput.addEventListener('input', () => {
      const inputValue = answerInput.value.trim().toLowerCase();
      if (inputValue === 'jamie') {
        videoPlayer.src = 'QuizVideos/Secret.webm';
        videoPlayer.play();
        videoPlayer.addEventListener('ended', () => {
          videoPlayer.src = `QuizVideos/${video.ID}.webm`;
        })
      }
      else if(inputValue === 'silent hill') {
        videoPlayer.src = 'QuizVideos/SilentHillSecret.webm';
        videoPlayer.play();
        videoPlayer.addEventListener('ended', () => {
        videoPlayer.src = `QuizVideos/${video.ID}.webm`;
      });
      }
      else if(inputValue === 'dj nun') {
        videoPlayer.src = 'QuizVideos/SecretNun.webm';
        videoPlayer.play();
        videoPlayer.addEventListener('ended', () => {
        videoPlayer.src = `QuizVideos/${video.ID}.webm`;
      })
      }
      else if(inputValue === 'tetris') {
      videoPlayer.src = 'QuizVideos/SecretTetris.webm';
      videoPlayer.play();
      videoPlayer.addEventListener('ended', () => {
      videoPlayer.src = `QuizVideos/${video.ID}.webm`;
      })
      }
      else if(inputValue === 'tips') {
        videoPlayer.src = 'QuizVideos/SecretTips.webm';
        videoPlayer.play();
        videoPlayer.addEventListener('ended', () => {
        videoPlayer.src = `QuizVideos/${video.ID}.webm`;
        })
      }
      else if(inputValue === "we'll bang ok") {
          videoPlayer.src = 'QuizVideos/SecretWellBang.webm';
          videoPlayer.play();
          videoPlayer.addEventListener('ended', () => {
          videoPlayer.src = `QuizVideos/${video.ID}.webm`;
          })
      }
    });
    
    loadProgress();
  });
});


const videoPlayer = document.getElementById('video-player');
const videoButtons = document.getElementById('button-grid');
const answerInput = document.getElementById('answer-input');
const answerFeedback = document.getElementById('answer-feedback');

const playPauseButton = document.getElementById('play-pause-button');
const rewindButton = document.getElementById('rewind-button');
const volumeSlider = document.getElementById('volume-slider');



let video = null;
let hintAvailable = false;
let hintShown = false;
let currentHint = '';

let currentSelectedButton = null;

fetch('quiz-data.json')
  .then(response => response.json())
  .then(data => {
    video = data[0];
    videoPlayer.src = `QuizVideos/${video.ID}.webm`;

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
          videoPlayer.src = `QuizVideos/${video.ID}.webm`;
          answerInput.disabled = false;
          answerInput.value = '';
          answerFeedback.innerText = '';
          playPauseButton.innerText = 'Play';
        
          hintAvailable = button.hintAvailable;
          hintShown = button.hintShown;
          currentHint = button.currentHint;
        
          if (hintAvailable && !hintShown) {
            hintLabel.innerText = 'Hint Available - Click here';
            hintLabel.style.color = 'black';
            hintLabel.addEventListener('click', showHint);
          } else if (hintShown) {
            hintLabel.innerText = `Hint: ${currentHint}`;
            hintLabel.style.color = 'red';
          } else {
            hintLabel.innerText = '';
            hintLabel.style.color = 'black';
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

    const answerForm = document.getElementById('answer-form');
    answerForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const inputValue = answerInput.value.trim().toLowerCase();
      let isMatch = false;
      for (const keyword of video.Keywords) {
        if (inputValue === keyword.toLowerCase()) {
          isMatch = true;
          break;
        }
      }
      if (isMatch) {
        answerFeedback.innerText = `Correct! The game was ${video.Name}!`;
        answerFeedback.style.color = 'green';
        answerInput.disabled = true;
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
        saveProgress(); // Save progress after a correct answer is given
      } else {
        answerFeedback.innerText = 'Incorrect.';
        answerFeedback.style.color ='red';
        SFXHandler(1, 'WrongAns');
      }
    });

    // Set up the hint display
    const hintLabel = document.getElementById('hint');
    videoPlayer.addEventListener('timeupdate', () => {
      const halfDuration = videoPlayer.duration / 2;
      if (videoPlayer.currentTime > halfDuration && !hintAvailable && !hintShown) {
        hintAvailable = true;
        const buttons = document.querySelectorAll('#button-grid button');
        for (const button of buttons) {
          if (button.videoData === video) {
            button.hintAvailable = true;
            button.addEventListener('click', showHint);
          }
        }
        hintLabel.innerText = 'Hint Available - Click here';
        hintLabel.style.color = '#AAB4BE';
        hintLabel.addEventListener('click', showHint);
      }
    });
    
    // Function to show the hint
    function showHint() {
      if (!hintShown) {
        hintShown = true;
        hintLabel.innerText = `Hint: ${video.Hint}`;
        hintLabel.style.color = '#8B728C';
      }
    }

    function saveProgress() {
      const progress = [];
      const buttons = document.querySelectorAll('#button-grid button');
      for (const button of buttons) {
        if (button.classList.contains('correct-answer')) {
          progress.push(button.videoData.ID);
        }
      }
      localStorage.setItem('quizProgress', JSON.stringify(progress));
    }

    // Added code for secret video event listener
    answerInput.addEventListener('input', () => {
      const inputValue = answerInput.value.trim().toLowerCase();
      if (inputValue === 'jamie') {
        videoPlayer.src = 'QuizVideos/Secret.webm';
        videoPlayer.play();
        videoPlayer.addEventListener('ended', () => {
          videoPlayer.src = `QuizVideos/${video.ID}.webm`;
        });
      }
    });
    
    function loadProgress() {
      const savedProgress = localStorage.getItem('quizProgress');
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        const buttons = document.querySelectorAll('#button-grid button');
        for (const button of buttons) {
          if (progress.includes(button.videoData.ID)) {
            button.classList.add('correct-answer');
            //button.disabled = true;
            button.style.backgroundColor = 'green';
            button.innerText = button.videoData.Name;
          }
        }
      }
    }
    loadProgress();
  });


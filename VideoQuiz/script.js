const videoPlayer = document.getElementById('video-player');
const videoButtons = document.getElementById('button-grid');
const answerInput = document.getElementById('answer-input');
const answerFeedback = document.getElementById('answer-feedback');

let video = null;
let hintAvailable = false;
let hintShown = false;
let currentHint = '';

// Load the video data from the JSON file
fetch('quiz-data.json')
  .then(response => response.json())
  .then(data => {
    // Set up the video player with the first video
    video = data[0];
    videoPlayer.src = `QuizVideos/${video.ID}.webm`;

    // Set up the video buttons
    for (const [index, videoData] of data.entries()) {
        const button = document.createElement('button');
        button.innerText = index + 1;
        button.videoData = videoData;
        button.hintAvailable = false;
        button.hintShown = false;
        button.currentHint = '';
        button.addEventListener('click', () => {
          video = videoData;
          videoPlayer.src = `QuizVideos/${video.ID}.webm`;
          answerInput.disabled = false;
          answerInput.value = '';
          answerFeedback.innerText = '';
  
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
            button.classList.remove('correct-answer');
            button.disabled = false;
          }
        });
        videoButtons.appendChild(button);
      }

    // ...


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
        answerFeedback.innerText = 'Correct!';
        answerFeedback.style.color = 'green';
        answerInput.disabled = true;
        const buttons = document.querySelectorAll('#button-grid button');
        for (const button of buttons) {
          if (button.videoData === video) {
            button.classList.add('correct-answer');
            button.disabled = true;
            button.style.backgroundColor = 'green';
          }
        }
        hintAvailable = false;
        hintShown = false;
        currentHint = '';
      } else {
        answerFeedback.innerText = '';
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
        hintLabel.style.color = 'black';
        hintLabel.addEventListener('click', showHint);
      }
    });
    
    // Function to show the hint
    function showHint() {
      if (!hintShown) {
        hintShown = true;
        hintLabel.innerText = `Hint: ${video.Hint}`;
        hintLabel.style.color = 'red';
      }
    }
  });
  
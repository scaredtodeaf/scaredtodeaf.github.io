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
    for (const [index, videoData] of data.entries()) { // Use entries() to get the index
      const button = document.createElement('button');
      button.innerText = index + 1; // Set the button text as the index + 1
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

        // Update hint status and hint text based on the button's state
        hintAvailable = button.hintAvailable;
        hintShown = button.hintShown;
        currentHint = button.currentHint;

        if (hintAvailable && !hintShown) {
          answerFeedback.innerText = 'Hint Available - Click here';
          answerFeedback.style.color = 'black';
        } else if (hintShown) {
          answerFeedback.innerText = `Hint: ${currentHint}`;
          answerFeedback.style.color = 'red';
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


    // Set up the answer input
    answerInput.addEventListener('keyup', () => {
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
    let currentButton = null; // Add this line to store the current button element
    videoPlayer.addEventListener('timeupdate', () => {
      const halfDuration = videoPlayer.duration / 2;
      if (videoPlayer.currentTime > halfDuration && !hintAvailable && !hintShown) {
        hintAvailable = true;
        const buttons = document.querySelectorAll('#button-grid button');
        for (const button of buttons) {
          if (button.videoData === video) {
            currentButton = button; // Update the currentButton variable
            button.hintAvailable = true;
            button.addEventListener('click', showHint);
          }
        }
        answerFeedback.innerText = 'Hint Available - Click here';
        answerFeedback.style.color = 'black';
        answerFeedback.addEventListener('click', showHint);
      }
    });

    // Function to show the hint
    function showHint() {
        if (!currentButton.hintShown) { // Use currentButton instead of this
          if (currentButton.currentHint === '') { // Use currentButton instead of this
            currentButton.currentHint = video.Hint; // Use currentButton instead of this
          }
          answerFeedback.innerText = `Hint: ${currentButton.currentHint}`; // Use currentButton instead of this
          answerFeedback.style.color = 'red';
          currentButton.hintShown = true; // Use currentButton instead of this
        }
      };
  });
const videoPlayer = document.getElementById('video-player');
const videoButtons = document.getElementById('button-grid');
const answerInput = document.getElementById('answer-input');
const answerFeedback = document.getElementById('answer-feedback');

let currentVideoIndex = 0;
let currentButton;

// Load the video data from the JSON file
fetch('quiz-data.json')
  .then(response => response.json())
  .then(data => {
    // Set up the video player with the first video
    const firstVideo = data[0];
    videoPlayer.src = `QuizVideos/${firstVideo.ID}.webm`;

    // Set up the video buttons
    for (let i = 0; i < data.length; i++) {
      const video = data[i];
      const button = document.createElement('button');
      button.innerText = video.Name;
      button.dataset.index = i;
      button.addEventListener('click', () => {
        currentVideoIndex = i;
        currentButton = button;
        videoPlayer.src = `QuizVideos/${video.ID}.webm`;
        answerInput.disabled = false;
        answerInput.value = '';
        answerFeedback.innerText = '';
      });
      videoButtons.appendChild(button);
    }

    currentButton = videoButtons.querySelector(`button[data-index="${currentVideoIndex}"]`);
    currentButton.classList.add('current-video');

    // Set up the answer input
    answerInput.addEventListener('keyup', () => {
      const inputValue = answerInput.value.trim().toLowerCase();
      let isMatch = false;
      for (const keyword of data[currentVideoIndex].Keywords) {
        if (inputValue === keyword.toLowerCase()) {
          isMatch = true;
          break;
        }
      }
      if (isMatch) {
        answerFeedback.innerText = 'Correct!';
        answerFeedback.style.color = 'green';
        currentButton.classList.add('correct-answer');
        answerInput.disabled = true;
      } else {
        answerFeedback.innerText = '';
      }
    });
  })
  .catch(error => console.error(error));

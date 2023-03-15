const videoSelect = document.getElementById('videoSelect');
const myVideo = document.getElementById('myVideo');
const playBtn = document.getElementById('playBtn');
const hintBtn = document.getElementById('hintBtn');
const hintDiv = document.getElementById('hintDiv');
const answerInput = document.getElementById('answerInput');
const myForm = document.getElementById('myForm');

// Load the JSON data
fetch('quiz-data.json')
  .then(response => response.json())
  .then(data => {
    // Populate the video options
    data.videos.forEach((video, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = video.src;
      videoSelect.appendChild(option);
    });

    // Set the default video
    myVideo.src = `QuizVideos/${data.videos[0].src}.webm`;

    // Set the answer and hint for the current video
    let currentAnswer = data.videos[0].answer;
    let currentHint = data.videos[0].hint;

    // Update the answer and hint when the user selects a different video
    videoSelect.addEventListener('change', () => {
      const selectedIndex = videoSelect.selectedIndex;
      myVideo.src = `QuizVideos/${data.videos[selectedIndex].src}.webm`;
      currentAnswer = data.videos[selectedIndex].answer;
      currentHint = data.videos[selectedIndex].hint;
      hintBtn.disabled = true;
      hintDiv.style.display = 'none';
      myForm.reset();
    });

    // Enable the hint button when the video reaches the halfway point
    myVideo.addEventListener('timeupdate', () => {
      if (myVideo.currentTime >= myVideo.duration / 2) {
        hintBtn.disabled = false;
      }
    });

    // Display the hint when the user clicks the hint button
    hintBtn.addEventListener('click', () => {
      hintDiv.textContent = currentHint;
      hintDiv.style.display = 'block';
    });

    // Handle form submission
    myForm.addEventListener('submit', event => {
      event.preventDefault();
      const userAnswer = answerInput.value.trim().toLowerCase();
      if (userAnswer === currentAnswer.toLowerCase()) {
        alert('Correct!');
      } else {
        alert('Incorrect!');
      }
      myForm.reset();
      hintDiv.style.display = 'none';
      hintBtn.disabled = true;
    });
  });

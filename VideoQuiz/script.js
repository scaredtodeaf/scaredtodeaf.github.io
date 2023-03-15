const videoSelect = document.getElementById('videoSelect');
const myVideo = document.getElementById('myVideo');
const playBtn = document.getElementById('playBtn');
const hintBtn = document.getElementById('hintBtn');
const hintDiv = document.getElementById('hintDiv');
const answerInput = document.getElementById('answerInput');
const myForm = document.getElementById('myForm');
const buttonContainer = document.getElementById('buttonContainer');

// Load the JSON data
fetch('quiz-data.json')
  .then(response => response.json())
  .then(data => {
    // Populate the video options and buttons
    data.videos.forEach((video, index) => {
      const option = document.createElement('option');
      option.value = index;
      option.textContent = video.src;
      videoSelect.appendChild(option);

      const button = document.createElement('button');
      button.className = 'button';
      button.textContent = `Question ${index + 1}`;
      buttonContainer.appendChild(button);

      button.addEventListener('click', () => {
        myVideo.src = `QuizVideos/${video.src}.webm`;
        currentAnswers = Array.isArray(video.answers) ? video.answers : [video.answers];
        currentHint = video.hint;
        hintBtn.disabled = true;
        hintDiv.style.display = 'none';
        myForm.reset();
      });
    });

    // Set the default video and answers/hint
    myVideo.src = `QuizVideos/${data.videos[0].src}.webm`;
    let currentAnswers = Array.isArray(data.videos[0].answers) ? data.videos[0].answers : [data.videos[0].answers];
    let currentHint = data.videos[0].hint;

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
      const userAnswer = answerInput.value.trim().toLowerCase().split(' ');
      const isCorrect = currentAnswers.some(answer => {
        const answerWords = answer.toLowerCase().split(' ');
        return answerWords.every(word => userAnswer.includes(word));
      });
      if (isCorrect) {
        alert('Correct!');
      } else {
        alert('Incorrect. Try again!');
      }
      myForm.reset();
    });
  });

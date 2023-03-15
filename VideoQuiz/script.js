// Define the quiz data file
const quizDataFile = "quiz-data.json";

// Select the video element
const myVideo = document.getElementById("myVideo");

// Select the answer input and form elements
const answerInput = document.getElementById("answerInput");
const myForm = document.getElementById("myForm");

// Select the button container
const buttonContainer = document.getElementById("buttonContainer");

// Select the hint button and div elements
const hintBtn = document.getElementById("hintBtn");
const hintDiv = document.getElementById("hintDiv");

// Define a variable to store the quiz data
let quizData;

// Load the quiz data
fetch(quizDataFile)
  .then(response => response.json())
  .then(data => {
    quizData = data;
    loadVideoOptions();
  })
  .catch(error => console.error(error));

// Load the video options into the select element
function loadVideoOptions() {
  const videoSelect = document.getElementById("videoSelect");

  quizData.videos.forEach(video => {
    const videoOption = document.createElement("option");
    videoOption.value = video.src;
    videoOption.textContent = video.src;
    videoSelect.appendChild(videoOption);
  });

  videoSelect.addEventListener("change", function(event) {
    const selectedVideoSrc = event.target.value;
    const selectedVideo = quizData.videos.find(video => video.src === selectedVideoSrc);
    myVideo.src = `QuizVideos/${selectedVideoSrc}.webm`;
    myVideo.load();
    loadButtonOptions(selectedVideo);
    resetQuiz();
  });
}

// Load the button options into the button container
function loadButtonOptions(selectedVideo) {
  buttonContainer.innerHTML = "";
  selectedVideo.answer.forEach(answer => {
    const answerButton = document.createElement("button");
    answerButton.textContent = answer;
    answerButton.addEventListener("click", function(event) {
      answerInput.value = event.target.textContent;
    });
    buttonContainer.appendChild(answerButton);
  });
}

// Handle the form submission
myForm.addEventListener("submit", function(event) {
  event.preventDefault();
  const selectedVideoSrc = document.getElementById("videoSelect").value;
  const selectedVideo = quizData.videos.find(video => video.src === selectedVideoSrc);
  const submittedAnswer = answerInput.value.toLowerCase();
  const correctAnswer = selectedVideo.answer.find(answer => answer.toLowerCase() === submittedAnswer);

  if (correctAnswer) {
    hintBtn.disabled = true;
    hintDiv.innerHTML = "";
    alert("Correct!");
  } else {
    alert("Incorrect. Please try again.");
  }

  resetQuiz();
});

// Handle the hint button click
hintBtn.addEventListener("click", function(event) {
  const selectedVideoSrc = document.getElementById("videoSelect").value;
  const selectedVideo = quizData.videos.find(video => video.src === selectedVideoSrc);
  const hint = selectedVideo.hint;
  hintDiv.innerHTML = hint;
});

// Reset the quiz
function resetQuiz() {
  answerInput.value = "";
  myVideo.currentTime = 0;
  myVideo.play();
}

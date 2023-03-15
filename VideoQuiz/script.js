// Define the video and select element
const video = document.getElementById("myVideo");
const select = document.getElementById("videoSelect");

// Define the button and input elements
const buttonContainer = document.getElementById("buttonContainer");
const answerInput = document.getElementById("answerInput");
const hintBtn = document.getElementById("hintBtn");
const hintDiv = document.getElementById("hintDiv");

// Define the video options as an array of objects
const videoOptions = [
  {
    src: "https://www.w3schools.com/tags/movie.mp4",
    answer: ["HTML"],
    hint: "It's a markup language",
    buttons: ["HTML", "CSS", "JavaScript", "Python"]
  },
  {
    src: "https://www.w3schools.com/tags/movie.ogg",
    answer: ["CSS"],
    hint: "It's used for styling",
    buttons: ["HTML", "CSS", "JavaScript", "Python"]
  },
  {
    src: "https://www.w3schools.com/html/mov_bbb.mp4",
    answer: ["JavaScript"],
    hint: "It's often abbreviated as JS",
    buttons: ["HTML", "CSS", "JavaScript", "Python"]
  },
  {
    src: "https://www.w3schools.com/tags/mov_bbb.ogg",
    answer: ["Python"],
    hint: "It's named after a comedy troupe",
    buttons: ["HTML", "CSS", "JavaScript", "Python"]
  }
];

// Populate the select element with the video options
videoOptions.forEach((option, index) => {
  const videoOption = document.createElement("option");
  videoOption.value = index;
  videoOption.text = option.answer[0];
  select.appendChild(videoOption);
});

// Update the video source and hint when a new option is selected
select.addEventListener("change", () => {
  const selectedOption = videoOptions[select.value];
  video.src = selectedOption.src;
  hintDiv.textContent = selectedOption.hint;
  hintBtn.disabled = false;

  // Clear previous buttons
  buttonContainer.innerHTML = "";

  // Create a button for each option
  selectedOption.buttons.forEach((option) => {
    const button = document.createElement("button");
    button.textContent = option;
    button.type = "button";
    button.classList.add("button-option");
    buttonContainer.appendChild(button);
  });
});

// Listen for button clicks
buttonContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("button-option")) {
    answerInput.value = event.target.textContent;
  }
});

// Listen for form submissions
myForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedOption = videoOptions[select.value];
  const answer = answerInput.value.trim().toLowerCase();
  const isCorrect = selectedOption.answer.some((option) =>
    option.toLowerCase() === answer
  );

  if (isCorrect) {
    alert("Correct!");
  } else {
    alert("Incorrect. Please try again.");
  }
});

// Listen for hint button clicks
hintBtn.addEventListener("click", () => {
  hintDiv.style.display = "block";
});

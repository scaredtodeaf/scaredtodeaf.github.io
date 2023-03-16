// Get a reference to the video player and the button grid
const videoPlayer = document.getElementById('video-player');
const buttonGrid = document.getElementById('button-grid');

// Load the JSON file
fetch('videos.json')
    .then(response => response.json())
    .then(data => {
        // Create a button for each video in the JSON data
        data.forEach(video => {
            const button = document.createElement('button');
            button.textContent = video.Name;
            button.addEventListener('click', () => {
                // Set the source of the video player to the selected video
                videoPlayer.src = `QuizVideos/${video.ID}.webm`;
                videoPlayer.load();
            });
            buttonGrid.appendChild(button);
        });
    });

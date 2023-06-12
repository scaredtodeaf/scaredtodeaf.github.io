function loadPage(url) {
  window.location.href = url;
}

const contentContainer = document.getElementById('content-container');
const sfxContent = document.getElementById('sfx-content');
const mediaContent = document.getElementById('media-content');

function playSound(sound) {
  // Add logic to play the corresponding sound based on the 'sound' parameter
  console.log(`Playing sound: ${sound}`);
}

function toggleCategory(category) {
  if (category === 'sfx') {
    sfxContent.style.display = 'block';
    mediaContent.style.display = 'none';
  } else if (category === 'media') {
    sfxContent.style.display = 'none';
    mediaContent.style.display = 'block';
  }
}

// Initial setup
toggleCategory('sfx');

// Event listeners for category toggling
const categoryButtons = document.querySelectorAll('.buttons .button.is-toggle');
categoryButtons.forEach(button => {
  button.addEventListener('click', () => {
    const category = button.dataset.category;
    toggleCategory(category);
  });
});

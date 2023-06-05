function loadPage(url) {
    const pageContent = $("#page-content");
    pageContent.load(url);
  }

  function toggle_visibility(element) {
    $(element).next('.sfx-group').toggle();
  }
  
  $(document).ready(function() {
    $('.category-list li').on('click', function() {
      var category = $(this).attr('data-category');
      $('.category-list li').removeClass('active');
      $(this).addClass('active');
      $('.table-container').removeClass('active').hide();
      $('#' + category + '-table').addClass('active').show();
    });
  
    $('.button').on('click', function() {
      var url = $(this).attr('data-url');
      $('#page-content').load(url);
    });
  
    // Hide all tables initially
    $('.table-container').hide();
  
    // Show the initial active table
    var initialCategory = $('.category-list li.active').attr('data-category');
    $('#' + initialCategory + '-table').show();
  });
  
  document.addEventListener('DOMContentLoaded', function() {
    const sfxDivs = document.querySelectorAll('.sfx-group div[name]');
  
    sfxDivs.forEach(function(div) {
      div.addEventListener('click', function(event) {
        const name = this.getAttribute('name').replace('!', ''); // Remove the exclamation mark
        const audio = new Audio('Redemptions/sounds/' + name + '.ogg'); // Adjust the audio file path
        audio.play();
      });
    });
  });
  

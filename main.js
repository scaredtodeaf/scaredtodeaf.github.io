function loadPage(url) {
    const pageContent = $("#page-content");
    pageContent.load(url);
  }

  $(document).ready(function() {
    // Function to populate the table with data
    function populateTable(category, data) {
      var table = $('#' + category + '-table');
      table.empty(); // Clear previous data
      
      // Iterate over the data and create table rows
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var row = $('<tr></tr>');
        var nameCell = $('<td></td>').text(item.name);
        var textCell = $('<td></td>').text(item.text);
        row.append(nameCell, textCell);
        table.append(row);
      }
    }
  
    $('.category-list li').on('click', function() {
      var category = $(this).attr('data-category');
      $('.category-list li').removeClass('active');
      $(this).addClass('active');
      $('.table-container').removeClass('active').hide();
      $('#' + category + '-table').addClass('active').show();
  
      // Load data from the JSON file
      $.getJSON('Redemptions/data.json', function(data) {
        // Load data into the table
        populateTable(category, data[category]);
      });
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
    
    // Load data from the JSON file for the initial active table
    $.getJSON('data.json', function(data) {
      // Load data into the initial active table
      populateTable(initialCategory, data[initialCategory]);
    });
  });
  

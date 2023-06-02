function openDiv(divId) {
    $('.content').hide();
    $('#' + divId).show();
  }
  
  function loadPage(url) {
    const pageContent = $("#page-content");
    pageContent.load(url);
  }
  
  function toggleTable(category) {
    $('.table-container').removeClass('active');
    $('#' + category + '-table').addClass('active');
  }
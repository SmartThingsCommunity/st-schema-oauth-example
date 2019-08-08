$( document ).ready(function() {
  $("input[name='signin']").click(function(evt) {
    $(this).addClass('processing')
  });
  $("input[name='register']").click(function(evt) {
    $(this).addClass('processing')
  });
  console.log('Initialized')
});

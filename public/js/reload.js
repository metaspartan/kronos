setInterval(function() {
    cache_clear()
}, 30000);

function cache_clear() {
  window.location=window.location;
  // window.location.reload(); use this if you do not remove cache
}
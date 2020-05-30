// progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/

var progValue = document.getElementById("ram").getAttribute("data-value");

var progValue2 = document.getElementById("cpu").getAttribute("data-value");

var bar = new ProgressBar.Circle(document.getElementById('container'), {
    color: '#444',
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 16,
    trailWidth: 1,
    trailColor: '#444',
    easing: 'easeInOut',
    duration: 1400,
    text: {
      autoStyleContainer: false
    },
    from: { color: '#ffd800', width: 1 },
    to: { color: '#ffd800', width: 16 },
    // Set default step function for all animate calls
    step: function(state, circle) {
      circle.path.setAttribute('stroke', state.color);
      circle.path.setAttribute('stroke-width', state.width);
  
      var value = Math.round(circle.value() * 100);
      if (value === 0) {
        circle.setText('~');
      } else {
        circle.setText('<span style="color: #FFF;font-size:32px;">' + value + '%</span><br /><span style="font-size:11px;">RAM In Use</span>');
      }
  
    }
  });
  bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar.text.style.fontSize = '2rem';
  
  bar.animate(progValue);  // Number from 0.0 to 1.0

  var bar2 = new ProgressBar.Circle(document.getElementById('container2'), {
    color: '#444',
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 16,
    trailWidth: 1,
    trailColor: '#444',
    easing: 'easeInOut',
    duration: 1400,
    text: {
      autoStyleContainer: false
    },
    from: { color: '#ffd800', width: 16 },
    to: { color: '#ffd800', width: 1 },
    // Set default step function for all animate calls
    step: function(state2, circle2) {
      circle2.path.setAttribute('stroke', state2.color);
      circle2.path.setAttribute('stroke-width', state2.width);
  
      var value2 = Math.round(circle2.value() * 100);
      if (value2 === 0) {
        circle2.setText('~');
      } else {
        circle2.setText('<span style="color: #FFF;font-size:32px;">' + value2 + '%</span><br /><span style="font-size:11px;">CPU In Use</span>');
      }
  
    }
  });
  bar2.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
  bar2.text.style.fontSize = '2rem';
  
  bar2.animate(progValue2);  // Number from 0.0 to 1.0
// progressbar.js@1.0.0 version is used
// Docs: http://progressbarjs.readthedocs.org/en/1.0.0/

var progValue3 = document.getElementById("blockcount").getAttribute("data-value");

var load = document.getElementById('blockpp');
  var bar = new ProgressBar.Line(document.getElementById('container3'), {
    strokeWidth: 4,
    easing: 'easeInOut',
    duration: 1400,
    color: '#ffd800',
    trailColor: '#444',
    trailWidth: 1,
    svgStyle: {width: '100%', height: '100%'},
    text: {
      style: {
        // Text color.
        // Default: same as stroke color (options.color)
        color: '#FFF',
        position: 'absolute',
        right: '50%',
        top: '0',
        padding: 0,
        margin: 0,
        transform: null
      },
      autoStyleContainer: false
    },
    from: {color: '#222'},
    to: {color: '#ffd800'},
    step: (state, bar) => {
      bar.setText('');
    }
  });
  
  bar.animate(progValue3);
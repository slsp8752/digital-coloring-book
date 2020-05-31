const smallBall = document.querySelector('.cursor__ball');

var slider = document.getElementById('sizeSlider');
    slider.addEventListener('input', resize);

resize();
// Listeners
document.body.addEventListener('mousemove', onMouseMove);

function showCursor(){
  var cursor = document.getElementById('cursorDiv');
  cursor.style.display = "block";
}

function hideCursor(){
  var cursor = document.getElementById('cursorDiv');
  cursor.style.display = "none";
}

function scaleValue(value, from, to) {
	var scale = (to[1] - to[0]) / (from[1] - from[0]);
	var capped = Math.min(from[1], Math.max(from[0], value)) - from[0];
	return ~~(capped * scale + to[0]);
}

// Move the cursor
function onMouseMove(e) {
var cursor = document.getElementById('circleCursor');
var svgSize = cursor.getAttributeNS(null, 'cx');
  smallBall.style.transform = "translate(" + (e.clientX - svgSize) + "px," + (e.clientY - svgSize) + "px)";
}

function resize(){
var cursor = document.getElementById('circleCursor');
var sliderVal = parseInt(slider.value, 10);
var sliderValScaled = scaleValue(sliderVal, [1, 100], [1,30]);
cursor.setAttributeNS(null, 'r', sliderValScaled);
cursor.setAttributeNS(null, 'cx', sliderValScaled+1);
cursor.setAttributeNS(null, 'cy', sliderValScaled+1);

var cursorPreview = document.getElementById('cursorPreview');
cursorPreview.setAttributeNS(null, 'r', sliderValScaled);
cursorPreview.setAttributeNS(null, 'cx', 31);
cursorPreview.setAttributeNS(null, 'cy', 31);
}

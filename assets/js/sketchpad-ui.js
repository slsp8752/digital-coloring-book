var el = document.getElementById('sketchpad');
var sliderVal = document.getElementById('sizeSlider').value;
var brushSize = scaleValue(sliderVal, [0,100], [1,30]) * 2;
var pad = new Sketchpad(el, {
  width: el.offsetWidth,
  aspectRatio: 1.1764,
  backgroundColor: "#ffffff",
  line: {
    size: brushSize,
    color: "#63c155"
  }
});

// setLineSize
function setLineSize(e) {
    var size = e.target.value;
    var sizeScaled = scaleValue(size, [0,100], [1,30]) * 2;

    pad.setLineSize(sizeScaled);
}
document.getElementById('sizeSlider').oninput = setLineSize;

// select coloring page
$(".caro-image").on("click", function(e){
    currentImage = $(this).attr('src');
    var aspect = $(this).context.height / $(this).context.width;
    pad.resize(el.offsetWidth, true, aspect);
});

// undo
function undo() {
    pad.undo();
}
document.getElementById('undo').onclick = undo;

// redo
function redo() {
    pad.redo();
}
document.getElementById('redo').onclick = redo;

// clear
function clear() {
    pad.clear();
}
document.getElementById('clear').onclick = clear;

// resize
window.onresize = function (e) {
  pad.resize(el.offsetWidth, false);
}

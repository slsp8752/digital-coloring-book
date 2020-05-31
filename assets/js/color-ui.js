
$(document).ready(function(){
  $('.carousel').slick({
    infinite: true,
    arrows: true,
    centerPadding: '10px',
    slidesToShow: 4,
    nextArrow: '<i class="fa fa-arrow-right arrow-right"></i>',
    prevArrow: '<i class="fa fa-arrow-left arrow-left"></i>'
  });
});

var eyedrop = document.getElementById('eyedrop');

eyedrop.addEventListener("click", function(){
  var sketchpad = document.getElementById('sketchpad');
  var cursor = document.getElementById('cursorDiv');
  if(eyedrop.classList.contains("button-primary")){
    eyedrop.classList.remove("button-primary");
    document.body.style.cursor = "default";
    sketchpad.style.cursor = "none";
    cursor.style.visibility = "visible";
  }
  else{
    eyedrop.classList.add("button-primary");
    document.body.style.cursor = "crosshair";
    sketchpad.style.cursor = "crosshair";
    cursor.style.visibility = "hidden";
  }

});


const pickr = Pickr.create({
    el: '#previewSvg',
    theme: 'monolith', // or 'monolith', or 'nano'
    comparison: false,
    useAsButton: true,
    lockOpacity: true,
    default: '#63c155',
    components: {

        // Main components
        preview: false,
        opacity: false,
        hue: true,

        // Input / output Options
        interaction: {
            hex: false,
            rgba: false,
            hsla: false,
            hsva: false,
            cmyk: false,
            input: false,
            clear: false,
            save: false
        }
    }
});

pickr.on('change', (color, instance) => {
    var rgb = color.toRGBA().toString();
    var cursorPreview = document.getElementById('cursorPreview');
    cursorPreview.setAttributeNS(null, 'fill', rgb);
    pad.setLineColor(rgb);
  });

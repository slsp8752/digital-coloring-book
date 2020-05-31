var currentImage = 'img/warp_frogs.png';
var myImage = new Image();

(function () {

    function mergeObjects(obj1, obj2) {
        var obj3 = {};
        var attrname;
        for (attrname in (obj1 || {})) {
            if (obj1.hasOwnProperty(attrname)) {
                obj3[attrname] = obj1[attrname];
            }
        }
        for (attrname in (obj2 || {})) {
            if (obj2.hasOwnProperty(attrname)) {
                obj3[attrname] = obj2[attrname];
            }
        }
        return obj3;
    }


    function Sketchpad(el, opts) {
        var that = this;

        if (!el) {
            throw new Error('Must pass in a container element');
        }

        opts = opts || {};
        var strokes = [];
        var undos = [];

        if (opts.data) {
      	    opts.aspectRatio = opts.data.aspectRatio;
      	    strokes = opts.data.strokes;
      	}

        opts.aspectRatio = opts.aspectRatio || 1;
        opts.width = opts.width || el.clientWidth;
        opts.height = opts.height || opts.width * opts.aspectRatio;
        opts.line = mergeObjects({
            color: '#000',
            size: 5,
            cap: 'round',
            join: 'round',
            miterLimit: 10
        }, opts.line);

        // Boolean indicating if currently drawing
        var sketching = false;

        // Create a canvas element
        var canvas = document.createElement('canvas');
        var canvas2 = document.createElement('canvas');
        canvas2.style.pointerEvents = "none";



        /**
         * Set the size of canvas
         */
        function setCanvasSize (width, height) {
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            //canvas.style.width = width + 'px';
            //canvas.style.height = height + 'px';
            canvas2.setAttribute('width', width);
            canvas2.setAttribute('height', height);
            //canvas2.style.width = width + 'px';
            canvas2.style.height = height + 'px';
        }

        /**
         * Get the size of the canvas
         */
        function getCanvasSize () {
            return {
                width: canvas.width,
                height: canvas.height
            };
        }

        setCanvasSize(opts.width, opts.height);
        el.appendChild(canvas);
        var canvases = document.getElementById("canvases");
        var el2 = document.getElementById("overlay");
        el2.appendChild(canvas2);
        var context = canvas.getContext('2d');
        var ctx2 = canvas2.getContext('2d');
        canvases.style.height = (canvas2.height) + "px";
        el.style.height = canvas.height + "px";
        el2.style.height = canvas2.height + "px";
        el2.style.position = "relative";
        el2.style.top = "-" + (canvas2.height+2) + "px";
        el2.style.marginBottom = "-" + (canvas2.height+2) + "px";
        myImage.src = currentImage;
        myImage.onload = function(){
          ctx2.drawImage(myImage, 0, 0, canvas.width, canvas.height);
        }

        /**
         * Returns a points x,y locations relative to the size of the canvase
         */
        function getPointRelativeToCanvas (point) {
            return {
                x: point.x / canvas.width,
                y: point.y / canvas.height
            };
        }

        /**
         * Returns true if is a touch event, false otherwise
         */
        function isTouchEvent (e) {
            return e.type.indexOf('touch') !== -1;
        }

        /**
         * Get location of the cursor in the canvas
         */
        function getCursorRelativeToCanvas (e) {
            var cur = {};

            if (isTouchEvent(e)) {
                cur.x = e.touches[0].pageX - canvas.offsetLeft;
                cur.y = e.touches[0].pageY - canvas.offsetTop;
            } else {
                var rect = that.canvas.getBoundingClientRect();
                cur.x = e.clientX - rect.left;
                cur.y = e.clientY - rect.top;
            }

            return getPointRelativeToCanvas(cur);
        }

        /**
         * Get the line size relative to the size of the canvas
         * @return {[type]} [description]
         */
        function getLineSizeRelativeToCanvas (size) {
            return size / canvas.width;
        }

        /**
         * Erase everything in the canvase
         */
        function clearCanvas (newImage) {
            context.clearRect(0, 0, canvas.width, canvas.height);
            if(newImage){
              ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
            }

            if (opts.backgroundColor) {
                context.fillStyle = opts.backgroundColor;
                context.fillRect(0, 0, canvas.width, canvas.height);
            }
        }

        var button = document.getElementById('btn-download');
        button.addEventListener('click', function (e) {
          var dataURL = downloadCanvas();
          button.download = currentImage.substr(4);
          button.href = dataURL;
        });

        function downloadCanvas() {
          var w = 1020;
          pad.resize(w,false,1);
          var hiddenCanvas = document.createElement('canvas');
          hiddenCanvas.style.display = 'none';
          document.body.appendChild(hiddenCanvas);
          hiddenCanvas.width = w;
          hiddenCanvas.height = hiddenCanvas.width * pad.opts.aspectRatio;
          var hiddenCtx = hiddenCanvas.getContext('2d');
          // load source image for overlay
          // onload: draw to canvas, return dataURL
          // async/await on dataURL in button listener
          hiddenCtx.drawImage(canvas, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
          hiddenCtx.drawImage(canvas2, 0, 0, canvas.width, canvas.height);
          var hiddenData = hiddenCanvas.toDataURL("image/png");
          pad.resize(el.offsetWidth,false,1);
          return hiddenData;
        }

        /**
         * Since points are stored relative to the size of the canvas
         * this takes a point and converts it to actual x, y distances in the canvas
         */
        function normalizePoint (point) {
            return {
                x: point.x * canvas.width,
                y: point.y * canvas.height
            };
        }

        /**
         * Since line sizes are stored relative to the size of the canvas
         * this takes a line size and converts it to a line size
         * appropriate to the size of the canvas
         */
        function normalizeLineSize (size) {
            return size * canvas.width;
        }

        /**
         * Draw a stroke on the canvas
         */
        function drawStroke (stroke) {
            context.beginPath();
            for (var j = 0; j < stroke.points.length - 1; j++) {
                var start = normalizePoint(stroke.points[j]);
                var end = normalizePoint(stroke.points[j + 1]);

                context.moveTo(start.x, start.y);
                context.lineTo(end.x, end.y);
            }
            context.closePath();

            context.strokeStyle = stroke.color;
            context.lineWidth = normalizeLineSize(stroke.size);
            context.lineJoin = stroke.join;
            context.lineCap = stroke.cap;
            context.miterLimit = stroke.miterLimit;

            context.stroke();
        }

        /**
         * Redraw the canvas
         */
        function redraw (newImage) {
            clearCanvas(newImage);
            var canvases = document.getElementById("canvases");
            canvases.style.height = (canvas2.height) + "px";
            el.style.height = canvas.height + "px";
            el2.style.height = canvas2.height + "px";
            el2.style.position = "relative";
            el2.style.top = "-" + (canvas2.height+2) + "px";
            if(newImage){
              myImage.src = currentImage;
              myImage.onload = function(){
                ctx2.drawImage(myImage, 0, 0, canvas.width, canvas.height);
              }
            }
            else{
              ctx2.drawImage(myImage, 0, 0, canvas.width, canvas.height);
            }

            if(!newImage){
              for (var i = 0; i < that.strokes.length; i++) {
                  drawStroke(that.strokes[i]);
              }
            }
            else{
              this.clear();
            }
        }

        // On mouse down, create a new stroke with a start location
        function startLine (e) {
            e.preventDefault();
            var eyedrop = document.getElementById('eyedrop');
            var sketchpad = document.getElementById('sketchpad');
            var cursor = document.getElementById('cursorDiv');
            if(eyedrop.classList.contains("button-primary")){
              getColor(e);
              eyedrop.classList.remove("button-primary");
              document.body.style.cursor = "default";
              sketchpad.style.cursor = "none";
              cursor.style.visibility = "visible";
            }
            else{
              strokes = that.strokes;
              sketching = true;
              that.undos = [];

              var cursor = getCursorRelativeToCanvas(e);
              strokes.push({
                  points: [cursor],
                  color: opts.line.color,
                  size: getLineSizeRelativeToCanvas(opts.line.size),
                  cap: opts.line.cap,
                  join: opts.line.join,
                  miterLimit: opts.line.miterLimit
              });
            }
        }

        function getColor(e){
          var cursorX = 0;
          var cursorY = 0;
          if (isTouchEvent(e)) {
            cursorX = 1;
            cursorX = e.touches[0].clientX;
            cursorY = e.touches[0].clientY;
          }
          else{
            cursorX = e.clientX;
            cursorY = e.clientY;
          }
          var canvasPos = canvas.getBoundingClientRect();
          var color = context.getImageData(cursorX - canvasPos.left, cursorY - canvasPos.top, 1, 1).data;
          color[3] = 1;
          var rgb = "rgba(" + color.join() + ")"
          pad.setLineColor(rgb);
          pickr.setColor(rgb)
        }

        function drawLine (e) {
            if (!sketching) {
                return;
            }

            e.preventDefault();

            var cursor = getCursorRelativeToCanvas(e);
            that.strokes[strokes.length - 1].points.push({
                x: cursor.x,
                y: cursor.y
            });

            that.redraw(false);
        }

        function endLine (e) {
            if (!sketching) {
                return;
            }

            e.preventDefault();

            sketching = false;

            if (isTouchEvent(e)) {
                return;  // touchend events do not have a cursor position
            }

            var cursor = getCursorRelativeToCanvas(e);
            that.strokes[strokes.length - 1].points.push({
                x: cursor.x,
                y: cursor.y
            });
            that.redraw(false);

            if (that.onDrawEnd) that.onDrawEnd();
        }

        // Event Listeners
        canvas.addEventListener('mousedown', startLine);
        canvas.addEventListener('touchstart', startLine);

        canvas.addEventListener('mousemove', drawLine);
        canvas.addEventListener('touchmove', drawLine);

        canvas.addEventListener('mouseup', endLine);
        canvas.addEventListener('mouseleave', endLine);
        canvas.addEventListener('touchend', endLine);

        if (typeof opts.onDrawEnd === 'function') {
            this.onDrawEnd = opts.onDrawEnd;
        }

        // Public variables
        this.canvas = canvas;
        this.strokes = strokes;
        this.undos = undos;
        this.opts = opts;

        // Public functions
        this.downloadCanvas = downloadCanvas;
        this.redraw = redraw;
        this.setCanvasSize = setCanvasSize;
        this.getPointRelativeToCanvas = getPointRelativeToCanvas;
        this.getLineSizeRelativeToCanvas = getLineSizeRelativeToCanvas;

        if (strokes) {
            redraw(false);
        }
    }


    Sketchpad.prototype.download = function () {
      this.downloadCanvas();
    };
    /**
     * Undo the last action
     */
    Sketchpad.prototype.undo = function () {
        if (this.strokes.length === 0){
            return;
        }

        this.undos.push(this.strokes.pop());
        this.redraw(false);
    };

    /**
     * Redo the last undo action
     */
    Sketchpad.prototype.redo = function () {
        if (this.undos.length === 0) {
            return;
        }

        this.strokes.push(this.undos.pop());
        this.redraw(false);
    };

    /**
     * Clear the sketchpad
     */
    Sketchpad.prototype.clear = function () {
        this.undos = [];  // TODO: Add clear action to undo
        this.strokes = [];
        this.redraw();
    };

    /**
     * Convert the sketchpad to a JSON object that can be loaded into
     * other sketchpads or stored on a server
     */
    Sketchpad.prototype.toJSON = function () {
        return {
            aspectRatio: this.canvas.width / this.canvas.height,
            strokes: this.strokes
        };
    };

    /**
     * Load a json object into the sketchpad
     * @return {object} - JSON object to load
     */
    Sketchpad.prototype.loadJSON = function (data) {
        this.strokes = data.strokes;
        this.redraw(false);
    };

    /**
     * Set the line size
     * @param {number} size - Size of the brush
     */
    Sketchpad.prototype.setLineSize = function (size) {
        this.opts.line.size = size;
    };

    /**
     * Set the line color
     * @param {string} color - Hexadecimal color code
     */
    Sketchpad.prototype.setLineColor = function (color) {
        this.opts.line.color = color;
    };

/**
* Converts to image File
* @param {string} type - example 'png'
*/
Sketchpad.prototype.toDataURL = function(type)
{
	return this.canvas.toDataURL(type);
}

    /**
     * Draw a line
     * @param  {object} start    - Starting x and y locations
     * @param  {object} end      - Ending x and y locations
     * @param  {object} lineOpts - Options for line (color, size, etc.)
     */
    Sketchpad.prototype.drawLine = function (start, end, lineOpts) {
        lineOpts = mergeObjects(this.opts.line, lineOpts);
        start = this.getPointRelativeToCanvas(start);
        end = this.getPointRelativeToCanvas(end);

        this.strokes.push({
            points: [start, end],
            color: lineOpts.color,
            size: this.getLineSizeRelativeToCanvas(lineOpts.size),
            cap: lineOpts.cap,
            join: lineOpts.join,
            miterLimit: lineOpts.miterLimit
        });
        this.redraw(false);
    };

    /**
     * Resize the canvas maintaining original aspect ratio
     * @param  {number} width - New width of the canvas
     */
    Sketchpad.prototype.resize = function (width, newImage, aspect) {
      if(newImage){
        //new aspect ratio
        this.opts.aspectRatio = aspect;
      }
        var height = width * this.opts.aspectRatio;
        this.opts.lineSize = this.opts.lineSize * (width / this.opts.width);
        this.opts.width = width;
        this.opts.height = height;

        this.setCanvasSize(width, height);
        this.redraw(newImage);
    };

    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = Sketchpad;
    } else {
        window.Sketchpad = Sketchpad;
    }
})();

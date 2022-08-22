import { fabric } from "fabric";

export default {
  getMousePosition(e, canvas) {
    var rect = canvas.getBoundingClientRect();
    var x = 0,
      y = 0;
    if (
      e.type == "touchstart" ||
      e.type == "touchmove" ||
      e.type == "touchend" ||
      e.type == "touchcancel"
    ) {
      var touch = e.touches[0] || e.changedTouches[0];
      x = touch.pageX;
      y = touch.pageY;
    } else if (
      e.type == "mousedown" ||
      e.type == "mouseup" ||
      e.type == "mousemove" ||
      e.type == "mouseover" ||
      e.type == "mouseout" ||
      e.type == "mouseenter" ||
      e.type == "mouseleave"
    ) {
      x = e.clientX;
      y = e.clientY;
    }
    return {
      x: x - rect.left,
      y: y - rect.top
    };
  },
  convertToBlob(canvas) {
    var binStr = atob(canvas.toDataURL("image/png", 1).split(",")[1]);
    var len = binStr.length;
    var arr = new Uint8Array(len);

    for (var i = 0; i < len; i++) {
      arr[i] = binStr.charCodeAt(i);
    }

    return new Blob([arr]);
  },
  renderBackgroundImage(canvas, imageUrl) {
    fabric.Image.fromURL(
      imageUrl,
      function(img) {
        img.set({
          left: 0,
          top: 0,
          evented: false
        });
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      },
      { crossOrigin: "anonymous" } // FIXME
    );
  },
  combineCanvas(canvasArray) {
    var newCanvas = document.createElement("canvas"),
      ctx = newCanvas.getContext("2d");

    newCanvas.width = canvasArray[0].width;
    newCanvas.height = canvasArray[0].height;

    canvasArray.forEach(function(n) {
      ctx.beginPath();
      ctx.drawImage(n, 0, 0);
    });

    return this.convertToBlob(newCanvas);
  }
};

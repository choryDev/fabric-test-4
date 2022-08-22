<template>
  <div class="wrapper">
    <button @click="addTextBox">Add Text</button>
    <button @click="removeSelected">Remove Selected Text</button>
    <button @click="clear">Clear</button>
    <button @click="saveToImage()">Convert to Image</button>
    <div>
      <button @click="toggleDrawing">{{ toggleLabel }}</button>
      <div class="tools-picker">
        <span
          @click="changeTools(tool)"
          v-for="tool in tools"
          :key="tool.name"
          :class="{ selected: selectedTool == tool.name }"
        >{{ tool.name }}</span>
      </div>
      <div class="color-picker">
        <span
          @click="changeColor(color)"
          v-for="color in colors"
          :key="color"
          :class="{ selected: selectedColor == color }"
          :style="{ backgroundColor: color }"
        ></span>
      </div>
    </div>
    <div id="drawingWrapper">
      <canvas
        id="stroke"
        ref="strokeCanvas"
        :class="{ isDrawing: enableDrawing }"
        @mousedown="beginDrawing"
        @touchstart="beginDrawing"
        @mouseup="stopDrawing"
        @touchend="stopDrawing"
        @mousemove="draw"
        @touchmove="draw"
      ></canvas>
      <canvas id="drawing" ref="fabricCanvas"></canvas>
      <img ref="image">
    </div>
  </div>
</template>

<script>
import { fabric } from "fabric";
import drawingUtils from "./drawing.utils";

export default {
  name: "Drawing",
  data() {
    return {
      canvas: null,
      ctx: null,
      drawingMode: false,
      enableDrawing: false,
      history: [],
      tools: [
        { name: "eraser", size: "10" },
        { name: "pencil", size: "2" },
        { name: "marker", size: "10" }
      ],
      colors: [
        "#FFCC00",
        "#5AC8FA",
        "#4CD964",
        "#FF3B30",
        "#FF9000",
        "#5B51DE",
        "#FFFFFF",
        "#231F20"
      ],
      selectedTool: "pencil",
      selectedColor: "#5AC8FA",
      x: 0,
      y: 0
    };
  },
  mounted() {
    this.canvas = new fabric.Canvas("drawing", {
      width: this.width,
      height: this.height,
      selection: false,
      enableRetinaScaling: false
    });

    if (this.imageUrl != "") {
      drawingUtils.renderBackgroundImage(this.canvas, this.imageUrl);
    }

    this.$refs.strokeCanvas.width = this.width;
    this.$refs.strokeCanvas.height = this.height;
    this.ctx = this.$refs.strokeCanvas.getContext("2d");
  },
  props: {
    width: { type: Number },
    height: { type: Number },
    imageUrl: { type: String }
  },
  computed: {
    toggleLabel() {
      return this.enableDrawing ? "Stop Drawing" : "Start Drawing";
    }
  },
  methods: {
    addTextBox() {
      this.drawingMode = false;
      var fabricTextBox = new fabric.Textbox("Type here", {
        fontSize: 18,
        fill: "grey",
        width: 80,
        left: this.width / 2,
        top: this.height / 2,
        selectable: true,
        lockRotation: true,
        hasRotatingPoint: false,
        backgroundColor: "#ffffff"
      });
      this.canvas.add(fabricTextBox);
    },
    removeSelected() {
      this.canvas.remove(this.canvas.getActiveObject());
    },
    saveToImage() {
      this.drawingMode = false;
      this.canvas.discardActiveObject().renderAll();
      var canvasArray = new Array();

      canvasArray.push(this.$refs.fabricCanvas);
      canvasArray.push(this.$refs.strokeCanvas);

      var imgBlob = URL.createObjectURL(
        drawingUtils.combineCanvas(canvasArray)
      );
      // const requestData = {
      //   file: imgBlob
      // };
      // drawingApi.saveDrawing(requestData);
      // img.setAttribute("width", this.width);
      this.$refs.image.src = imgBlob;
    },
    toggleDrawing() {
      this.enableDrawing = !this.enableDrawing;
      this.canvas.discardActiveObject().renderAll();
    },
    draw(e) {
      e.preventDefault();
      var pos = drawingUtils.getMousePosition(e, this.$refs.strokeCanvas);
      if (this.drawingMode) {
        this.drawLine(this.x, this.y, pos.x, pos.y);
        this.x = pos.x;
        this.y = pos.y;
      }
    },
    drawLine(x1, y1, x2, y2) {
      if (this.selectedTool === "eraser") {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.strokeStyle = "rgba(0,0,0,1)";
      } else {
        this.ctx.globalCompositeOperation = "source-over";
        this.ctx.strokeStyle = this.selectedColor;
      }
      this.ctx.lineCap = "round";
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
      this.ctx.closePath();
    },
    beginDrawing(e) {
      e.preventDefault();
      var pos = drawingUtils.getMousePosition(e, this.$refs.strokeCanvas);
      this.x = pos.x;
      this.y = pos.y;
      this.drawingMode = true;
    },
    stopDrawing(e) {
      e.preventDefault(e);
      if (this.drawingMode) {
        var pos = drawingUtils.getMousePosition(e, this.$refs.strokeCanvas);
        this.drawLine(this.x, this.y, pos.x, pos.y);
        this.x = 0;
        this.y = 0;
        this.drawingMode = false;
      }
    },
    changeTools(tool) {
      this.selectedTool = tool.name;
      this.ctx.lineWidth = tool.size;
    },
    changeColor(color) {
      this.selectedColor = color;
    },
    undo() {
      if (this.canvas._objects.length > 0) {
        this.history.push(this.canvas._objects.pop());
        this.canvas.renderAll();
      }
    },
    redo() {
      if (this.history.length > 0) {
        this.canvas.add(this.history.pop());
      }
    },
    clear() {
      this.canvas.clear();
      this.ctx.clearRect(0, 0, this.width, this.height);
      if (this.imageUrl != "") {
        drawingUtils.renderBackgroundImage(this.canvas, this.imageUrl);
      }
    }
  }
};
</script>

<style scoped lang="scss">
#drawingWrapper {
  position: relative;
  canvas {
    position: absolute;
    touch-action: none;
  }
}
#stroke {
  z-index: 1;
  pointer-events: none;
  &.isDrawing {
    pointer-events: all;
  }
}
.tools-picker,
.color-picker {
  span {
    cursor: pointer;
    margin: 0.25rem;
    border: 2px solid #8f8f8f;
    &.selected {
      border-color: aquamarine;
    }
  }
}
.color-picker {
  span {
    display: inline-block;
    width: 2rem;
    height: 2rem;
    border-radius: 50%;
  }
}
</style>

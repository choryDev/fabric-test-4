<template>
  <div id="app">
    <drawing :width="640" :height="480" :imageUrl="'https://i.imgur.com/3tU4Vig.jpg'"/>
  </div>
</template>

<script>
import drawing from "./components/Drawing.vue";

export default {
  name: "App",
  components: {
    drawing
  }
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

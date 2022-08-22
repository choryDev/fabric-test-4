import { createStore } from "vuex";

export const ADD_ITEM_TO_CANVAS = "ADD_ITEM_TO_CANVAS";
export const SAVE_JSON = "SAVE_JSON";

// Create a new store instance.
const store = createStore({
  state() {
    return {
      json: [],
      newCanvasItem: null
    };
  },
  mutations: {
    [ADD_ITEM_TO_CANVAS](state: any, payload) {
      state.newCanvasItem = payload;
    },
    [SAVE_JSON](state, payload) {
      state.json = payload;
    }
  }
});

export default store;

import * as React from "react";
import createStore from "zustand";
import * as localforage from "localforage";
import { reduce, omit } from "lodash";

type StoreContent = {
  data: { [key: string]: any };
  relations: { [key: string]: Array<string> };
};

type StoreActions = {
  initiate: () => void;
  getData: (id: string) => any;
  setData: (id: string) => (value: any, childrenIds?: Array<string>) => void;
  remove: (id: string) => () => void;
};

type BlocksStore = StoreContent & StoreActions;

const blocksStore = localforage.createInstance({ name: "blocks" });

const [useStore] = createStore<BlocksStore>((set, get) => {
  return {
    data: {},
    relations: {},
    initiate: async () => {
      const store: StoreContent = (await blocksStore.getItem("store")) || {
        data: {},
        relations: {}
      };
      set(state => ({
        data: { ...state.data, ...store.data },
        relations: { ...state.relations, ...store.relations }
      }));
    },
    setData: id => (value, childrenIds = []) => {
      set((state: StoreContent) => {
        const data = { ...state.data, [id]: value };
        const relations = { ...state.relations, [id]: childrenIds };
        blocksStore.setItem("store", { data, relations });
        return { data, relations };
      });
    },
    getData: id => {
      const state: BlocksStore = get();
      if (Object.keys(state.data).length === 0) state.initiate();
      const data = state.data[id] || {};
      const childrenData = reduce(
        state.relations[id],
        (res, childId) => ({ ...res, ...state.data[childId] }),
        {}
      );
      return {
        ...childrenData,
        ...data
      };
    },
    remove: id => () =>
      set(state => ({
        data: omit(state.data, id),
        relations: omit(state.relations, id)
      }))
  };
});

export default useStore;

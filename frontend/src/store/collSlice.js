import { DeleteRequest, DuplicateRequest, ImportCollection } from "../../wailsjs/go/main/App";
import { MoveRequest } from "../../wailsjs/go/main/App";
import { DeleteCollection } from "../../wailsjs/go/main/App";
import { RenameRequest } from "../../wailsjs/go/main/App";
import { AddCollection, AddCollectionWithParent, GetCollections, RenameCollection, UpsertRequest } from "../../wailsjs/go/main/App";
import { nanoid } from "nanoid";
import { tabSchema } from "./tabSlice";
import { cleanUpRequest } from "../utils/utils";
import { toast } from "react-toastify";
export const createColSlice = (set, get) => ({
  collections: [],
  cLoading: false,
  saveLoad: false,
  getCollections: async () => {
    set({ cLoading: true });
    let rsp = await GetCollections();
    if (!rsp.success) {
      set({ cLoading: false });
      return;
    }
    set({ cLoading: false, collections: rsp.data });
  },
  importCollection: async () => {
    set({ cLoading: true });
    let rsp = await ImportCollection();
    if (!rsp.success) {
      set({ cLoading: false });
      toast.error(rsp.msg);
      return;
    }
    set({ cLoading: false, collections: rsp.data });
    toast.success(rsp.msg);
  },
  addCols: async (c) => {
    set({ cLoading: true });
    let rsp = await AddCollection(c.id, c.name);
    if (!rsp.success) {
      set({ cLoading: false });
      return false;
    }
    set({ cLoading: false, collections: rsp.data });
    return true;
  },
  addColsWithParent: async (c) => {
    set({ cLoading: true });
    let rsp = await AddCollectionWithParent(c.id, c.name, c.parent_id || "");
    if (!rsp.success) {
      set({ cLoading: false });
      return false;
    }
    set({ cLoading: false, collections: rsp.data });
    return true;
  },
  addNewReqtoCol: async (coll_id) => {
    set({ saveLoad: true });
    let rClone = tabSchema({ coll_id });
    let t = cleanUpRequest(rClone);
    let rsp = await UpsertRequest(t);
    if (!rsp.success) {
      set({ saveLoad: false });
      return false;
    }
    set({ collections: rsp.data, saveLoad: false });
    set((x) => {
      x.tabs = [...x.tabs, t];
      x.tabInx = x.tabs.length - 1;
    });
    return true;
  },
  onDuplicateReq: async (coll_id, id) => {
    set({ cLoading: true });
    let rsp = await DuplicateRequest(coll_id, id);
    if (!rsp.success) {
      set({ cLoading: false });
      return false;
    }
    set({ cLoading: false, collections: rsp.data });
    return true;
  },
  updateReq: async (id) => {
    set({ saveLoad: true });
    let tab = get().tabs.find((t) => t.id === id);
    let rClone = structuredClone(tab);
    delete rClone.response;
    let t = cleanUpRequest(rClone);
    let rsp = await UpsertRequest(t);
    if (!rsp.success) {
      set({ saveLoad: false });
      return false;
    }
    set({ collections: rsp.data, saveLoad: false });
    return true;
  },
  saveReq: async (id, name, coll_id) => {
    //get tab by id and edit col_id and call backed with req
    //delete tab when collection is deleted
    set({ saveLoad: true });
    let tab = get().tabs.find((t) => t.id === id);
    let rClone = structuredClone(tab);
    delete rClone.response;
    let t = cleanUpRequest(rClone);
    t.name = name;
    t.coll_id = coll_id;
    let rsp = await UpsertRequest(t);
    if (!rsp.success) {
      set({ saveLoad: false });
      return false;
    }
    set({ collections: rsp.data });
    set((x) => {
      let tab = x.tabs.find((t) => t.id === id);
      if (tab) {
        tab.name = name;
        tab.coll_id = coll_id;
      }
      x.saveLoad = false;
    });
    return true;
  },
  renameCollection: async (id, name) => {
    set({ cLoading: true });
    let rsp = await RenameCollection(id, name);
    if (!rsp.success) {
      set({ cLoading: false });
      return false;
    }
    set({ collections: rsp.data, cLoading: false });
    return true;
  },
  renameReq: async (coll_id, id, name) => {
    set({ cLoading: true });
    let rsp = await RenameRequest(coll_id, id, name);
    if (!rsp.success) {
      set({ cLoading: false });
      return false;
    }
    set((x) => {
      let t = x.tabs.find((t) => t.id === id);
      if (t) {
        t.name = name;
      }
      x.collections = rsp.data;
      x.cLoading = false;
    });
    return true;
  },
  deleteReq: async (coll_id, id) => {
    set({ cLoading: true });
    let rsp = await DeleteRequest(coll_id, id);
    if (!rsp.success) {
      set({ cLoading: false });
      return false;
    }
    set((x) => {
      x.collections = rsp.data;
      x.cLoading = false;
    });
    get().deleteTab(id);
    return true;
  },
  deleteCol: async (coll_id) => {
    set({ cLoading: true });
    let rsp = await DeleteCollection(coll_id);
    if (!rsp.success) {
      set({ cLoading: false });
      return false;
    }
    set((x) => {
      x.collections = rsp.data;
      x.cLoading = false;
      x.tabs = x.tabs.filter((t) => t.coll_id !== coll_id);
    });
    return true;
  },
  moveReq: async (id, coll_id, new_coll_id) => {
    let new_id = nanoid();
    set({ cLoading: true });
    let rsp = await MoveRequest(id, new_id, coll_id, new_coll_id);
    if (!rsp.success) {
      set({ cLoading: false });
      return false;
    }
    set((x) => {
      x.collections = rsp.data;
      let tab = x.tabs.find((t) => t.id === id);
      if (tab) {
        tab.id = new_id;
        tab.coll_id = new_coll_id;
      }
      x.cLoading = false;
    });
    return true;
  },
});

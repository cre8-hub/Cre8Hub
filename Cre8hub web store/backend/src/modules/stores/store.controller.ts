import { Request, Response } from "express";
import {
  createStoreService,
  publishStoreService,
  getPublicStoreService,
  getMyStoreService,
  updateStoreService,
} from "./store.service";
import { AuthRequest } from "../../middleware/auth.middleware";

export const createStore = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { storeName } = req.body;
    if (!storeName) {
      return res.status(400).json({ message: "Store name required" });
    }
    const store = await createStoreService(req.user.id, storeName);
    res.status(201).json(store);
  } catch (err: any) {
    res.status(err.status || 400).json({ message: err.message });
  }
};

export const publishStore = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { storeId } = req.params;
    const store = await publishStoreService(storeId, req.user.id);
    res.json(store);
  } catch (err: any) {
    res.status(err.status || 403).json({ message: err.message });
  }
};

export const getPublicStore = async (
  req: Request,
  res: Response
) => {
  try {
    const { slug } = req.params;
    const store = await getPublicStoreService(slug);
    res.json(store);
  } catch (err: any) {
    res.status(err.status || 404).json({ message: err.message });
  }
};

export const getMyStore = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const store = await getMyStoreService(req.user.id);
    return res.status(200).json(store);
  } catch (err: any) {
    return res.status(err.status || 404).json({
      message: err.message || "Store not found",
    });
  }
};

export const updateStore = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { store_name, description, banner_url } = req.body;
    if (!store_name) {
      return res.status(400).json({ message: "store_name is required" });
    }
    const store = await updateStoreService(req.user.id, store_name, description, banner_url);
    return res.status(200).json(store);
  } catch (err: any) {
    return res.status(err.status || 400).json({ message: err.message });
  }
};
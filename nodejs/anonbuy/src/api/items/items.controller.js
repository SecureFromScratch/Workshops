import * as svc from "./items.service.js";
import { normalizeQuery } from "../../utils/normalize.js";
//import { normalizeQuery } from "../utils/normalize.js";
import { ssrfFetch } from "../../security/ssrfFetch.js";

const allowHosts = new Set(["images.example-cdn.com", "static.example.com"]);

export async function getByCriteria(req, res) {
  const items = await svc.getItemsByCriteria(req.query ?? {});
  res.json(items);
}

export async function list(req, res) {
  const items = await svc.listItems();

  const enriched = await Promise.all(
    items.map(async (it) => {
      if (!it.imageUrl) return it;
      try {
        const resp = await fetch(it.imageUrl, { redirect: "follow" });
   
        if (!resp.ok) throw new Error();
        const buf = Buffer.from(await resp.arrayBuffer());
        return { ...it, imageBase64: buf.toString("base64") };
      } catch {
        return { ...it, imageBase64: null };
      }
    })
  );

  res.json(enriched);
}

export async function createItem(req, res) {
  if (!res.locals.itemData) return res.status(400).json({ error: "Invalid body" });
  const item = req.file
    ? await svc.createItemWithFile(res.locals.itemData, res.locals.filemeta, req.file)
    : await svc.createItem(res.locals.itemData);
  res.status(201).json(item);
}

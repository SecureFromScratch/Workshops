import * as svc from "../services/items.service.js";
import { normalizeQuery } from "../utils/normalize.js";
//import { normalizeQuery } from "../utils/normalize.js";
import { ssrfFetch } from "../security/ssrfFetch.js";

const allowHosts = new Set(["images.example-cdn.com", "static.example.com"]);


export async function getByCriteria(req, res) {
  //const items = await svc.getItemsByCriteria(req.query ?? {});
   const items = await svc.getItemsByCriteria(req.criteria, req.pagination);
  res.json(items);
}

export async function createWithFile(req, res) {
  const item = await svc.createItemWithFile(req.itemData, req.file ?? null);
  return res.status(201).json(item);
}


export async function list(req, res) {
  const items = await svc.listItems();

  const enriched = await Promise.all(
    items.map(async (it) => {
      if (!it.imageUrl) return it;
      try {
        //const resp = await fetch(it.imageUrl, { redirect: "follow" });
        const resp = await ssrfFetch("https://images.example-cdn.com/path/pic.jpg");
        
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


export async function create(req, res) {
  if (!req.itemData) return res.status(400).json({ error: "Invalid body" });
  const item = await svc.create(req.itemData);
  res.status(201).json(item);
}






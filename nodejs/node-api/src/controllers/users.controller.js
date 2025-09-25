import * as svc from "../services/users.service.js";

export async function list(req, res) {
  const data = await svc.listUsers();
  res.json(data);
}

export async function create(req, res) {
  const user = await svc.createUser(req.body);
  res.status(201).json(user);
}

const db = [];

export async function listUsers() {
  return db;
}

export async function createUser(payload) {
  const user = { id: db.length + 1, ...payload };
  db.push(user);
  return user;
}

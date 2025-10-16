export default (err, req, res, _next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Error";
  if (status >= 500) console.error(err);
  res.status(status).json({ error: message });
};

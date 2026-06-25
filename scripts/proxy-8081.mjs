import http from "http";
import net from "net";

const TARGET = 5000;
const PORT = 8081;

const server = http.createServer((req, res) => {
  const opts = {
    hostname: "127.0.0.1",
    port: TARGET,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };
  const proxy = http.request(opts, (pr) => {
    res.writeHead(pr.statusCode, pr.headers);
    pr.pipe(res, { end: true });
  });
  proxy.on("error", (e) => {
    res.writeHead(502);
    res.end("proxy error: " + e.message);
  });
  req.pipe(proxy, { end: true });
});

server.on("upgrade", (req, socket, head) => {
  const conn = net.connect(TARGET, "127.0.0.1", () => {
    const reqLine =
      `${req.method} ${req.url} HTTP/1.1\r\n` +
      Object.entries(req.headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\r\n") +
      "\r\n\r\n";
    conn.write(reqLine);
    if (head && head.length) conn.write(head);
    conn.pipe(socket);
    socket.pipe(conn);
  });
  conn.on("error", () => socket.destroy());
  socket.on("error", () => conn.destroy());
});

server.listen(PORT, () =>
  console.log(`[proxy] :${PORT} → :${TARGET}`)
);

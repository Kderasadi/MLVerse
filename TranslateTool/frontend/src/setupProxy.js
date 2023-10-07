const { createProxyMiddleware } = require("http-proxy-middleware");
const proxy = require("http-proxy-middleware");
module.exports = function (app) {
  app.use(
    createProxyMiddleware(
      "/api/", // replace with your endpoint
      { target: "http://localhost:7000", changeOrigin: true } // replace with your target
    )
  );
};

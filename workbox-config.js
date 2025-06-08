module.exports = {
  globDirectory: "./",
  globPatterns: ["**/*.{html,js,css,jpg,jpeg,png,webp,svg,woff2}"],
  swDest: "service-worker.js",
  clientsClaim: true,
  skipWaiting: true,
};

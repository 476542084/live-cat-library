const MODE_PROD = process.env.NODE_ENV === "production";
module.exports = {
  plugins: {
    autoprefixer: {},
    ...(MODE_PROD ? { cssnano: {} } : {}),
  },
};

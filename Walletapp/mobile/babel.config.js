module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          alias: {
            "@": "./", // now "@/components" points to "project-root/components"
          },
        },
      ],
      "expo-router/babel", // keep this for expo-router
    ],
  };
};

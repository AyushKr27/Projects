module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // 👇 MUST be last for reanimated
      [
        "module-resolver",
        {
          alias: {
            "@": "./",
            "@components": "./components",
            "@assets": "./assets",
            "@hooks": "./hooks",
            "@lib": "./lib",
            "@screens": "./app"
          }
        }
      ],
      "react-native-reanimated/plugin"
    ]
  };
};

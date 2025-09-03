export default function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // 👇 MUST be first for react-native-reanimated to work properly
      "react-native-reanimated/plugin",
      [
        "module-resolver",
        {
          alias: {
            "@": "./",               // Root
            "@components": "./components",
            "@assets": "./assets",
            "@hooks": "./hooks",
            "@lib": "./lib",
            "@screens": "./app",
          },
        },
      ],
      // 👇 Keep this for expo-router
      "expo-router/babel",
    ],
  };
};

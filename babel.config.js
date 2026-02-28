module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }], // Mandatory for v4
      "nativewind/babel", // The NativeWind processing plugin
    ],
    plugins: [
      ["inline-import", { "extensions": [".sql"] }], // <--- THIS FIXES THE ERROR
      "react-native-reanimated/plugin",
    ],
  };
};
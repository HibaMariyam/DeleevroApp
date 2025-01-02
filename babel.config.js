module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            'react-native-device-info': './react-native-device-info.ts',
          },
        },
      ],
    ],
  };
};

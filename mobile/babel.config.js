module.exports = function (api) {
  // Mantém cache da configuração para melhorar performance do Metro/Babel.
  api.cache(true);

  return {
    // Preset padrão do Expo para transpilar React Native.
    presets: ['babel-preset-expo'],
    plugins: [
      // Necessário para os decorators legacy usados pelo WatermelonDB
      // (@text, @field, @relation, etc).
      ['@babel/plugin-proposal-decorators', { legacy: true }],
    ],
  };
};
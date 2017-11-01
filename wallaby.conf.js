module.exports = function (wallaby) {
  return {
    files: [
      'src/**/*.js',
      'test/fixtures/**',
      'test/helpers/**',
    ],

    tests: [
      'test/**/*.test.js'
    ],

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },

    env: {
      type: 'node'
    },

    testFramework: 'ava',
  };
};

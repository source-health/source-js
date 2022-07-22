/* eslint-disable */
const withTranspileModules = require('next-transpile-modules')(['@source-health/js', '@source-health/js-bridge'])

module.exports = withTranspileModules({
  reactStrictMode: true,
})

/* global artifacts */
/* eslint no-undef: "error" */

module.exports = function (deployer) {
  deployer.deploy(artifacts.require('Migrations'))
}

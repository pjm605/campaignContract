var Campaign = artifacts.require("./Campaign.sol");



var campaignDuration = 5;
var campaignGoal = 1000;

module.exports = function(deployer) {
  deployer.deploy(Campaign, campaignDuration, campaignGoal);
};

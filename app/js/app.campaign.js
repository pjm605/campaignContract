
require("file-loader?name=../index.html!../index.html");

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const campaignJson = require("../../build/contracts/Campaign.json");

if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
}
Promise.promisifyAll(web3.eth, { suffix: "Promise" });
Promise.promisifyAll(web3.version, { suffix: "Promise" });


const Campaign = truffleContract(campaignJson);
Campaign.setProvider(web3.currentProvider);

var app = angular.module('app', []);

app.config(function ($locationProvider) {
    $locationProvider.html5Mode(false);
});


app.controller("CampaignCtrl", [ '$scope', '$location', '$http', '$q', '$window', '$timeout', 
  function ($scope, $location, $http, $q, $window, $timeout) {
  $scope.contributionLog = [];
  
  Campaign.deployed()
  .then(function (_instance) {
    $scope.contract = _instance;
    console.log("The Contract:", $scope.contract);

    //don't want this to happen before the contract is known

    $scope.contributionWatcher = $scope.contract.LogContribution({}, {fromBlock: 0})
    .watch(function (err, newContribution) {
      if (err) {
        console.log("Error watching contribution events", err);
      } else {
        console.log("Contribution", newContribution);
        newContribution.args.amount = newContribution.args.amount.toString(10);
        $scope.contributionLog.push(newContribution);
        return $scope.getCampaignStatus();
      }
    })

    return $scope.getCampaignStatus();
  })

  //Contribute to the campaign
  $scope.contribute = function () {
    if (parseInt($scope.newContribution) <= 0) return;
    console.log("contribution", $scope.newContribution);
    var newContribution = $scope.newContribution;
    $scope.newContribution = "";
    $scope.contract.contribute({ from: $scope.account, value: parseInt(newContribution), gas: 900000 })
    .then(function (txn) {
      console.log("Transaction Receipt, " , txn);
      return $scope.getCampaignStatus();
    })
    .catch(function (err) {
      console.log("Error processing contribution, ", err);
    });
  }

  //Get the campaign status
  $scope.getCampaignStatus = function () {
    return $scope.contract.fundsRaised({from: $scope.account})
    .then(function (_fundsRaised) {
      console.log("fundsRaised", _fundsRaised.toString(10));
      $scope.campaignFundsRaised = _fundsRaised.toString(10);
      return $scope.contract.goal({ from: $scope.account });
    }) 
    .then(function (_goal) {
      console.log("goal", _goal.toString(10));
      $scope.campaginGoal = _goal.toString(10);
      return $scope.contract.deadline({ from: $scope.account });
    })
    .then(function (_deadline) {
      console.log("deadline", _deadline.toString(10));
      $scope.campaignDeadline = _deadline.toString(10);
      return $scope.contract.owner({ from: $scope.account });
    })
    .then(function (_owner) {
      console.log("owner", _owner);
      $scope.campaignOwner = _owner;
      return $scope.contract.isSuccess({ from: $scope.account });
    })
    .then(function (_isSuccess) {
      console.log("isSuccess", _isSuccess);
      $scope.campaignIsSuccess = _isSuccess;
      return $scope.contract.hasFailed({ from: $scope.account });
    })
    .then(function (_hasFailed) {
      console.log("hasFailed", _hasFailed);
      $scope.campaignHasFailed = _hasFailed;
      return $scope.getCurrentblockNumber();
    })
  }


  $scope.getCurrentblockNumber = function () {
    web3.eth.getBlockNumber(function (err, bn) {
      if (err) {  
        console.log("error getting block number", err)
      } else {
         console.log("Current block number", bn);
         $scope.blockNumber = bn;
         $scope.$apply();
      } 

    })
  }

  web3.eth.getAccounts(function (err, accs) {
    if (err != null) {
      console.log ("There was an error fetching you accounts");
      return; 
    }
    
    if (accs.length == 0) {
      console.log ("There was zero account")
      return;
    }

    $scope.accounts = accs;
    $scope.account = $scope.accounts[0];
    console.log("using account", $scope.accounts);

    web3.eth.getBalance($scope.account, function (err, _balance) {
      $scope.balance = _balance.toString(10);
      $scope.balanceInEth = web3.fromWei ($scope.balance, "ether");
      $scope.$apply();
    })

  })
    


}])

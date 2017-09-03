pragma solidity ^0.4.6;

import "./Stoppable.sol";
import "./Campaign.sol";

contract Hub is Stoppable {
    
    address[] public campaigns;
    mapping (address => bool) campaignExists;
    
    modifier onlyIfCampaign (address campaign)
    {
        if (campaignExists[campaign] != true) throw;
        _;
    }
    
    event LogNewCampaign(address sponsor, address campaign, uint duration, uint goal);
    event LogCampaignStoppaed(address sender, address campaign);
    event LogCampaignStarted(address sender, address campaign);
    event LogCampaignNewOwner(address sender, address campaign, address newOwner);
    
    function getCampaignCount() 
        public
        constant
        returns(uint campaignCount) 
    {
        return campaigns.length;
    }
    
    function createCampaign (uint campaignDuration, uint campaignGoal) 
        public
        returns (address campaignContract)
    {
        Campaign trustedCampaign = new Campaign(msg.sender, campaignDuration, campaignGoal);
        campaigns.push(trustedCampaign);
        campaignExists[trustedCampaign] = true;
        
        LogNewCampaign(msg.sender, trustedCampaign, campaignDuration, campaignGoal);
        return trustedCampaign;
    }
    
    function stopCampaign(address campaign) 
        onlyOwner
        onlyIfCampaign(campaign)
        returns(bool success)
    {
        Campaign trustedCampaign = Campaign (campaign);
        LogCampaignStoppaed(msg.sender, campaign);
        return (trustedCampaign.runSwitch(false));
    }
    
    function startCampaign(address campaign) 
        onlyOwner
        onlyIfCampaign(campaign)
        returns(bool success)
    {
        Campaign trustedCampaign = Campaign (campaign);
        LogCampaignStarted (msg.sender, campaign);    
        return (trustedCampaign.runSwitch(true));
    }
    
    function changeCampaignOwner(address campaign, address newOwner) 
        onlyOwner
        onlyIfCampaign(campaign)
        returns(bool success)
    {
        Campaign trustedCampaign = Campaign (campaign);
        LogCampaignNewOwner(msg.sender, newOwner, campaign);
        return (trustedCampaign.changeOwner(newOwner));
    }

}
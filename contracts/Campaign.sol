pragma solidity ^0.4.6;

contract Campaign {
    address public owner;
    uint    public deadline;
    uint    public goal;
    uint    public fundsRaised;
    
    struct FunderStruct {
        uint amountContributed;
        uint amountRefunded;
    }
    
    mapping (address => FunderStruct) public funderStructs;
    
    event LogContribution (address sender, uint amount);
    event LogRefundSent (address funder, uint amount);
    event LogWithdrawal (address beneficiary, uint amount);
    
    function Campaign (uint campaignDuration, uint campaignGoal) {
        owner = msg.sender;
        deadline = block.number + campaignDuration;
        goal = campaignGoal;
    }
    
    function isSuccess () public constant returns (bool isIndeed) {
        return (fundsRaised >= goal);
    }
    
    function hasFailed () public constant returns (bool hasIndeed) {
        return (fundsRaised < goal && block.number > deadline);
    }
    
    function contribute () public payable returns (bool success) {
        if (msg.value == 0) throw;
        if (isSuccess()) throw;
        if (hasFailed()) throw;
        
        fundsRaised += msg.value;

        funderStructs[msg.sender].amountContributed += msg.value;
        LogContribution(msg.sender, msg.value);
        
        return true;
    }
    
    function withdrawFunds () public returns (bool success) {
        if (msg.sender != owner) throw;
        if (!isSuccess()) throw;
        uint amount = this.balance;
        owner.send(amount);
        LogWithdrawal(owner, this.balance);
        
        return true;
    }

    function requetRefund ()
        public
        returns (bool succes)
    {
        uint amountOwed = funderStructs[msg.sender].amountContributed - funderStructs[msg.sender].amountRefunded;
        if (amountOwed == 0) throw;
        if (!hasFailed()) throw;
        
        funderStructs[msg.sender].amountRefunded += amountOwed;
        if (!msg.sender.send(amountOwed)) throw;
        LogRefundSent(msg.sender, amountOwed);
        return true;
    }

}




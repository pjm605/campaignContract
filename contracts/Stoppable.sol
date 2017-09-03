pragma solidity ^ 0.4.6;

import "./Owned.sol";

contract Stoppable is Owned {
    bool    public running;
    
    event LogRunSwitch ( bool switchSetting);
    
    function Stoppable () {
        running = true;
    }
     
    modifier onlyIfRunning {
       if (!running) throw;
        _;
    }
    
    function runSwitch(bool onOff) 
        onlyOwner
        returns(bool success)
    {
        running = onOff;
        LogRunSwitch ( onOff);
        return true;
    }
}
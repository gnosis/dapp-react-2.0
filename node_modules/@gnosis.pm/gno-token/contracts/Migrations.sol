pragma solidity ^0.4.21;

contract Migrations {
    address internal owner;
    uint public lastCompletedMigration;

    modifier restricted() {
        if (msg.sender == owner) _;
    }

    function Migrations() public {
        owner = msg.sender;
    }

    function setCompleted(uint completed) external restricted {
        lastCompletedMigration = completed;
    }
}

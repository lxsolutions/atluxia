






// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/JobEscrow.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // Deploy JobEscrow contract
        new JobEscrow();

        vm.stopBroadcast();
    }
}






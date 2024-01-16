// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Game} from "cog/IGame.sol";
import {State} from "cog/IState.sol";
import {Schema} from "@ds/schema/Schema.sol";
import {Actions} from "@ds/actions/Actions.sol";
import {BuildingKind} from "@ds/ext/BuildingKind.sol";
import "@ds/utils/Base64.sol";
import "@ds/utils/LibString.sol";

using Schema for State;

contract DataTest5 is BuildingKind {

    function updateCount(uint32 count) external {}

    uint256 gameActive = 0; // count?

    // we expect payload to contain a single 4 byte number reperesenting length of session in blocks
    function use(Game ds, bytes24 buildingInstance, bytes24, bytes calldata payload) public {
        
        // convert payload
        // uint32 payloadAsUint32;
        // for (uint i = 0; i < 4; i++) {
        //     payloadAsUint32 = (payloadAsUint32 << 8) | uint32(uint8(payload[i]));
        // }

        if (bytes4(payload) == this.updateCount.selector) {
            (uint32 count) =
                abi.decode(payload[4:], (uint32));

            State state = GetState(ds);
            bytes24 buildingkind = state.getBuildingKind(buildingInstance);

            // Convert bytes24 to bytes32
            // bytes32 countAsBytes32 = bytes32(count);

            // Convert bytes32 to uint256
            // uint256 countAsUint256 = uint256(countAsBytes32);

            state.annotate(buildingkind, "description", LibString.toString(count));
        }

        // string memory annotation = string(abi.encodePacked(
        //             LibString.toString(gameActive), 
        //             ", ", 
        //             LibString.toString(startDuck), 
        //             ", ", 
        //             LibString.toString(startBurger)
        //         ));

        
    }

    function GetState(Game ds) internal returns (State) {
        return ds.getState();
    }
}

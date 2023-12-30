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

contract DataTest3 is BuildingKind {
    uint256 gameActive = 0;
    uint256 recieveCount = 0;
    uint256 startDuck = 0;
    uint256 startBurger = 0;

    // we expect payload to contain a single 4 byte number reperesenting length of session in blocks
    function use(Game ds, bytes24 buildingInstance, bytes24, bytes memory payload) public {
        
        // convert payload
        uint32 payloadAsUint32;
        for (uint i = 0; i < 4; i++) {
            payloadAsUint32 = (payloadAsUint32 << 8) | uint32(uint8(payload[i]));
        }

        if (payloadAsUint32 == 123){
            recieveCount = 1;
            gameActive = 1;
            return;
        }

        if (payloadAsUint32 == 321){
            gameActive = 0;
        }

        if (gameActive == 1){
            if (recieveCount == 1){
                recieveCount++;
                startDuck = payloadAsUint32;
                return;
            }

            if (recieveCount == 2){
                recieveCount = 0;
                startBurger = payloadAsUint32;
                return;
            }
        }

        string memory annotation = string(abi.encodePacked(
                    LibString.toString(gameActive), 
                    ", ", 
                    LibString.toString(startDuck), 
                    ", ", 
                    LibString.toString(startBurger)
                ));

        State state = GetState(ds);
        bytes24 buildingkind = state.getBuildingKind(buildingInstance);
        state.annotate(buildingkind, "description", annotation);
    }

    function GetState(Game ds) internal returns (State) {
        return ds.getState();
    }
}

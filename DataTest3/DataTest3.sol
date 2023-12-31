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
    uint256 gameActive = 0; // unused

    // we expect payload to contain a single 4 byte number reperesenting length of session in blocks
    function use(Game ds, bytes24 buildingInstance, bytes24, bytes memory payload) public {
        
        // convert payload
        uint32 payloadAsUint32;
        for (uint i = 0; i < 4; i++) {
            payloadAsUint32 = (payloadAsUint32 << 8) | uint32(uint8(payload[i]));
        }
        
        // Use the concatenated string in the state.annotate call
        State state = GetState(ds);
        bytes24 buildingkind = state.getBuildingKind(buildingInstance);
        state.annotate(buildingkind, "description", LibString.toString(payloadAsUint32));
    }

    function GetState(Game ds) internal returns (State) {
        return ds.getState();
    }
}

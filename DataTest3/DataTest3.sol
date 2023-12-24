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

    // we expect payload to contain a single 4 byte number reperesenting length of session in blocks
    function use(Game ds, bytes24 buildingInstance, bytes24, /*actor*/ bytes memory payload ) public {
        // Extract values
        uint32 packedValues;
        for (uint i = 0; i < 3; i++) {
            packedValues = (packedValues << 8) | uint32(uint8(payload[i]));
        }

        // Now packedValues contains the three values in its 24 least significant bits
        uint8 gameActive = uint8(packedValues >> 16); // Extracts the first byte
        uint8 numDuck = uint8(packedValues >> 8);    // Extracts the second byte
        uint8 numBurger = uint8(packedValues);       // Extracts the third byte

        // Convert values to strings and concatenate
        string memory result = string(abi.encodePacked(
            LibString.toString(gameActive), ", ",
            LibString.toString(numDuck), ", ",
            LibString.toString(numBurger)
        ));

        // Write to building kind description
        State state = GetState(ds);
        bytes24 buildingkind = state.getBuildingKind(buildingInstance);
        state.annotate(buildingkind, "description", result);
    }

    function GetState(Game ds) internal returns (State) {
        return ds.getState();
    }
}

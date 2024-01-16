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

contract DataTest6 is BuildingKind {

    function setGameActive(uint32 _gameActive) external {}
    function setDuckBurger(uint32 _startDuck, uint32 _startBurger) external {}
    function setAllGameValues(uint32 _gameActive, uint32 _startDuck, uint32 _startBurger) external {}

    uint32 gameActive = 0;
    uint256 startDuck = 0;
    uint256 startBurger = 0;

    // we expect payload to contain a single 4 byte number reperesenting length of session in blocks
    function use(Game ds, bytes24 buildingInstance, bytes24, bytes calldata payload) public {
        
        if (bytes4(payload) == this.setGameActive.selector) {
            (uint32 _gameActive) = abi.decode(payload[4:], (uint32));
            gameActive = _gameActive;
        }
        
        if (bytes4(payload) == this.setDuckBurger.selector) {
            (uint32 _startDuck, uint32 _startBurger) = abi.decode(payload[4:], (uint32, uint32));
            startDuck = _startDuck;
            startBurger = _startBurger;
        }
        
        if (bytes4(payload) == this.setAllGameValues.selector) {
            (uint32 _gameActive, uint32 _startDuck, uint32 _startBurger) = abi.decode(payload[4:], (uint32, uint32, uint32));
            gameActive = _gameActive;
            startDuck = _startDuck;
            startBurger = _startBurger;
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

import ds from 'downstream';

var numDuckStart = 0;
var numBurgerStart = 0;

var numDuck = 0;
var numBurger = 0;

var gameActive = false;

function numberToBytes32(number) {
    let hexStr = number.toString(16);
    if (hexStr.length > 8) {
        hexStr = hexStr.substring(hexStr.length - 8);
    }
    while (hexStr.length < 8) {
        hexStr = '0' + hexStr;
    }
    return '0x' + hexStr;
}

function numbersToBytes32(gameActive, numDuck, numBurger) {
    let hexStr = gameActive.toString(16).padStart(2, '0') +
                 numDuck.toString(16).padStart(2, '0') +
                 numBurger.toString(16).padStart(2, '0');
    while (hexStr.length < 32) {
        hexStr = '0' + hexStr;
    }
    return '0x' + hexStr;
}

function packValuesToBytes32(gameActive, numDuck, numBurger) {
    let hexStr = gameActive.toString(16).padStart(2, '0') + 
                 numDuck.toString(16).padStart(2, '0') +
                 numBurger.toString(16).padStart(2, '0');
    while (hexStr.length < 32) {
        hexStr = '0' + hexStr;
    }
    return '0x' + hexStr;
}

export default async function update(state) {
    // uncomment this to browse the state object in browser console
    // this will be logged when selecting a unit and then selecting an instance of this building
    //logState(state);

    const selectedTile = getSelectedTile(state);
    const selectedBuilding = selectedTile && getBuildingOnTile(state, selectedTile);

    const countBuildings = (buildingsArray, type) => {
        return buildingsArray.filter(building =>
            building.kind?.name?.value.toLowerCase().includes(type)
        ).length;
    }
    
    const startGame = () => {
        const mobileUnit = getMobileUnit(state);
        const buildingsArray = state.world?.buildings || [];
    
        numDuckStart = countBuildings(buildingsArray, "duck");
        numBurgerStart = countBuildings(buildingsArray, "burger");
    
        numDuck = 0;
        numBurger = 0;
        gameActive = true;

        // 1 because gameActive is true
        const payload = numberToBytes32(1);

        // ds.dispatch({
        //     name: 'BUILDING_USE',
        //     args: [selectedBuilding?.id, mobileUnit?.id, payload],
        // });
    }

    const endGame = () => {
        const mobileUnit = getMobileUnit(state);
        const buildingsArray = state.world?.buildings || [];
    
        const totalDuck = countBuildings(buildingsArray, "duck");
        const totalBurger = countBuildings(buildingsArray, "burger");
    
        numDuck = totalDuck - numDuckStart;
        numBurger = totalBurger - numBurgerStart;
        gameActive = false;

        // 0 because gameActive is false
        const payload = numberToBytes32(0);

        // ds.dispatch({
        //     name: 'BUILDING_USE',
        //     args: [selectedBuilding?.id, mobileUnit?.id, payload],
        // });
    }

    const updateNumDuckBurger = () => {
        const buildingsArray = state.world?.buildings || [];
    
        const totalDuck = countBuildings(buildingsArray, "duck");
        const totalBurger = countBuildings(buildingsArray, "burger");
    
        numDuck = totalDuck - numDuckStart;
        numBurger = totalBurger - numBurgerStart;
    }

    if (gameActive){
        updateNumDuckBurger();
    }

    const mobileUnit = getMobileUnit(state);
    const payload = packValuesToBytes32(gameActive ? 1 : 0, numDuck, numBurger);
    ds.dispatch({
        name: 'BUILDING_USE',
        args: [selectedBuilding?.id, mobileUnit?.id, payload],
    });
    
    return {
        version: 1,
        components: [
            {
                id: 'duck-burger-counter',
                type: 'building',
                content: [
                    {
                        id: 'default',
                        type: 'inline',
                        html: `
                            🦆: ${numDuck}</br>
                            🍔: ${numBurger}</br></br>
                            ${
                                gameActive 
                                    ? `duck burger is live!</br></br>
                                    click "End & Count Score" to see who won`
                                    : `click "Start Game" to play`
                            }
                        `,

                        buttons: [
                            {
                                text: 'Start Game',
                                type: 'action',
                                action: startGame,
                                disabled: gameActive,
                            },
                            {
                                text: 'End Game',
                                type: 'action',
                                action: endGame,
                                disabled: !gameActive,
                            },
                        ],
                    },
                ],
            },
        ],
    };
}


function getMobileUnit(state) {
    return state?.selected?.mobileUnit;
}

function getSelectedTile(state) {
    const tiles = state?.selected?.tiles || {};
    return tiles && tiles.length === 1 ? tiles[0] : undefined;
}

function getBuildingOnTile(state, tile) {
    return (state?.world?.buildings || []).find((b) => tile && b.location?.tile?.id === tile.id);
}


function logState(state) {
    console.log('State sent to pluging:', state);
}
// the source for this code is on github where you can find other example buildings:
// https://github.com/playmint/ds/tree/main/contracts/src/example-plugins

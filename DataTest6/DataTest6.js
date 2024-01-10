import ds from 'downstream';

var numDuck = 0;
var numBurger = 0;

function buildingDescriptionData(description){
    let values = description.split(', ').map(Number);
    return {
        gameActive: values[0] === 1,
        startDuck: values[1],
        startBurger: values[2]
    };
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
        numDuck = 0;
        numBurger = 0;

        const buildingsArray = state.world?.buildings || [];
        const numDuckStart = countBuildings(buildingsArray, "duck");
        const numBurgerStart = countBuildings(buildingsArray, "burger");

        const payload = ds.encodeCall(
            "function setAllGameValues(uint32 _gameActive, uint32 _startDuck, uint32 _startBurger)",
            [1, numDuckStart, numBurgerStart]
          );

        ds.dispatch({
            name: 'BUILDING_USE',
            args: [selectedBuilding?.id, mobileUnit?.id, payload],
        });
    }

    const endGame = () => {
        const mobileUnit = getMobileUnit(state);
        const payload = ds.encodeCall(
            "function setGameActive(uint32 _gameActive)",
            [0]
          );
        ds.dispatch({
            name: 'BUILDING_USE',
            args: [selectedBuilding?.id, mobileUnit?.id, payload],
        });
    }

    const updateNumDuckBurger = () => {
        const buildingsArray = state.world?.buildings || [];
    
        const totalDuck = countBuildings(buildingsArray, "duck");
        const totalBurger = countBuildings(buildingsArray, "burger");
    
        numDuck = totalDuck - buildingDescriptionData(selectedBuilding?.kind?.description?.value || "0, 0, 0").startDuck;
        numBurger = totalBurger - buildingDescriptionData(selectedBuilding?.kind?.description?.value || "0, 0, 0").startBurger;
    }

    const gameActive = buildingDescriptionData(selectedBuilding?.kind?.description?.value || "0, 0, 0").gameActive;

    if (gameActive){
        updateNumDuckBurger();
    }

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

import ds from 'downstream';

var count = 0;

export default async function update(state) {
    // uncomment this to browse the state object in browser console
    // this will be logged when selecting a unit and then selecting an instance of this building
    //logState(state);

    const selectedTile = getSelectedTile(state);
    const selectedBuilding = selectedTile && getBuildingOnTile(state, selectedTile);

    const addCount = () => {
        count++;
        const mobileUnit = getMobileUnit(state);
        const payload = ds.encodeCall(
            "function updateCount(uint32 count)",
            [count]
          );

        ds.dispatch({
            name: 'BUILDING_USE',
            args: [selectedBuilding?.id, mobileUnit?.id, payload],
        });
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
                            The count (${count}) should be shown in the description if all is working correctly
                        `,
                        buttons: [
                            {
                                text: 'Start Game',
                                type: 'action',
                                action: addCount,
                                disabled: false,
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

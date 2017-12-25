import * as fs from 'mz/fs';

type Component = number[];

interface ComponentTable {
    [pinSize: number]: Component[];
}

async function findSolution(inputFilePath: string = './input.txt') {
    const input = await fs.readFile(require.resolve(inputFilePath), 'utf8');

    let components: Component[] = input
        .split('\n')
        .map(line => line.trim().split('/').map(num => parseInt(num)));

    let table: ComponentTable = {};

    components.forEach(component => {
        component.forEach(port => {
            table[port] = (table[port] || []);
            table[port].push(component);
        });
    });

    console.log(`Part 1: ${findStrongestBridge(0, [])}`);
    console.log(`Part 2: ${findLongestBridge(0, []).strength}`);

    function findStrongestBridge(nextPinSize: number, bridge: Component[]): number {
        let strongest = bridge.reduce((acc, component) => acc + component[0] + component[1], 0);
        table[nextPinSize].forEach(component => {
            if (bridge.indexOf(component) !== -1) {
                return;
            }

            let newPinSize = component[0] === nextPinSize ? component[1]: component[0];
            strongest = Math.max(strongest, findStrongestBridge(newPinSize, [...bridge, component]));
        });

        return strongest;
    }
    
    function findLongestBridge(nextPinSize: number, bridge: Component[]): {length: number, strength: number } {
        let result = {
            length: bridge.length,
            strength: bridge.reduce((acc, component) => acc + component[0] + component[1], 0),
        }
        table[nextPinSize].forEach(component => {
            if (bridge.indexOf(component) !== -1) {
                return;
            }

            let newPinSize = component[0] === nextPinSize ? component[1]: component[0];
            let newResult = findLongestBridge(newPinSize,  [...bridge, component]);

            if (newResult.length >= result.length && newResult.strength >= result.strength) {
                result = newResult;
            }
        });

        return result;
    }
}

findSolution();
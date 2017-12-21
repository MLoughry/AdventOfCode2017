import * as fs from 'mz/fs';

const inputRegex = /([.#]{2,3})\/([.#]{2,3})\/?([.#]{2,3})? => ([.#]{3,4})\/([.#]{3,4})\/([.#]{3,4})\/?([.#]{3,4})?/;
type GridTransform = (grid: string[][]) => string[][] | undefined;

const startGrid = [['.', '#', '.'], ['.', '.', '#'], ['#', '#', '#']];

async function findSolution(inputFilePath: string = './input.txt') {
    const input = await fs.readFile(require.resolve(inputFilePath), 'utf8');

    let mappings: GridTransform[] = input
        .split('\n')
        .map(line => {
            let [
                match,
                in0, in1, in2,
                out0, out1, out2, out3
            ] = inputRegex.exec(line)!;

            let inputGrid = [in0.split(''), in1.split('')];
            if (in2) {
                inputGrid.push(in2.split(''));
            }

            let outputGrid = [out0.split(''), out1.split(''), out2.split('')];
            if (out3) {
                outputGrid.push(out3.split(''));
            }

            return applyMapping.bind(null, permutateGrid(inputGrid), outputGrid) as GridTransform;
        });

    let grid = startGrid.map(row => [...row]);
    for (let iterations = 0; iterations < 18; iterations++) {
        grid = transformGrid();
        if (iterations === 5) {
            console.log(`Part 1: ${countLightsOn()}`);
        }
    }

    console.log(`Part 2: ${countLightsOn()}`);


    function countLightsOn() {
        let onCount = 0;
        grid.forEach(row => {
            row.forEach(cell => {
                if (cell === '#') {
                    onCount++;
                }
            });
        });
        return onCount;
    }

    function transformGrid(): string[][] {
        let newGrid: string[][] = [];
        let subGridSize = 3;

        if (grid.length % 2 === 0) {
            subGridSize = 2;
        }

        for (let i = 0; i < grid.length / subGridSize; i++) {
            for (let j = 0; j < grid.length / subGridSize; j++) {
                let subGrid: string[][] = [];
                for (let x = 0; x < subGridSize; x++) {
                    subGrid[x] = [];

                    for (let y = 0; y < subGridSize; y++) {
                        subGrid[x][y] = grid[i * subGridSize + x][j * subGridSize + y];
                    }
                }

                let transformedSubgrid: string[][] | undefined;
                for (let t = 0; t < mappings.length; t++) {
                    transformedSubgrid = mappings[t](subGrid);

                    if (transformedSubgrid) {
                        break;
                    }
                }

                if (transformedSubgrid) {
                    for (let x = 0; x <= subGridSize; x++) {
                        let row = i * (subGridSize + 1) + x;
                        newGrid[row] = newGrid[row] || [];

                        for (let y = 0; y <= subGridSize; y++) {
                            let col = j * (subGridSize + 1) + y;
                            newGrid[row][col] = transformedSubgrid[x][y];
                        }
                    }
                } else {
                    throw new Error(`No mapping for:\n${subGrid.map(row => row.join('')).join('\n')}`)
                }
            }
        }

        return newGrid;
    }
}

function rotateGridRight(grid: string[][]): string[][] {
    let newGrid: string[][] = grid.map(row => [...row]);

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid.length; j++) {
            newGrid[i][j] = grid[j][grid.length - i - 1]
        }
    }

    return newGrid;
}

function rotateGridLeft(grid: string[][]): string[][] {
    let newGrid: string[][] = grid.map(row => [...row]);
    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid.length; j++) {
            newGrid[i][j] = grid[grid.length - j - 1][i];
        }
    }

    return newGrid;
}

function rotateGrid180(grid: string[][]): string[][] {
    let newGrid: string[][] = grid.map(row => [...row]);

    for (let i = 0; i < grid.length; i++) {
        for (let j = 0; j < grid.length; j++) {
            newGrid[i][j] = grid[grid.length - j - 1][grid.length - i - 1]
        }
    }

    return newGrid;
}

function flipGridVertically(grid: string[][]) {
    return [...grid].reverse();
}

function flipGridHorizontally(grid: string[][]) {
    return grid.map(row => [...row].reverse());
}

function permutateGrid(grid: string[][]): string[][][] {
    return [
        grid,
        flipGridVertically(grid),
        flipGridHorizontally(grid),
        flipGridHorizontally(flipGridVertically(grid)),
        rotateGridLeft(grid),
        rotateGridRight(grid),
        rotateGrid180(grid),
        flipGridVertically(rotateGridLeft(grid)),
        flipGridVertically(rotateGridRight(grid)),
        flipGridVertically(rotateGrid180(grid)),
        flipGridHorizontally(rotateGridLeft(grid)),
        flipGridHorizontally(rotateGridRight(grid)),
        flipGridHorizontally(rotateGrid180(grid)),
        flipGridVertically(flipGridHorizontally(rotateGridLeft(grid))),
        flipGridVertically(flipGridHorizontally(rotateGridRight(grid))),
        flipGridVertically(flipGridHorizontally(rotateGrid180(grid))),
    ]
}

function applyMapping(inputMappings: string[][][], outputMapping: string[][], testGrid: string[][]): string[][] | undefined {
    if (inputMappings[0].length !== testGrid.length) {
        return undefined;
    }

    for (let i = 0; i < inputMappings.length; i++) {
        if (gridsAreEqual(inputMappings[i], testGrid)) {
            return outputMapping;
        }
    }

    return undefined;
}

function gridsAreEqual(a: string[][], b: string[][]): boolean {
    for (let i = 0; i < a.length; i++) {
        if (!arraysAreEqual(a[i], b[i])) {
            return false;
        }
    }
    return true;
}

function arraysAreEqual(a: string[], b: string[]): boolean {
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i]) {
            return false;
        }
    }
    return true;
}

findSolution();
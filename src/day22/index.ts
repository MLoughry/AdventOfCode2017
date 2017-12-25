import * as fs from 'mz/fs';

interface Vector {
    x: number;
    y: number;
}

interface VirusPosition {
    position: Vector;
    direction: Vector;
}

async function findSolution(inputFilePath: string = './input.txt') {
    const input = await fs.readFile(require.resolve(inputFilePath), 'utf8');

    solvePart1(input);
    solvePart2(input);
}

function solvePart1(input: string) {
    const grid: string[][] = input.split('\n').map(line => line.trim().split(''));
    let virus: VirusPosition = {
        position: {
            x: Math.floor(grid.length / 2),
            y: Math.floor(grid[0].length / 2)
        },
        direction: {
            x: -1,
            y: 0
        }
    };
    let infectionCount = 0;
    for (let i = 0; i < 10000; i++) {
        let row = virus.position.x;
        let col = virus.position.y;
        grid[row] = grid[row] || [];
        if (grid[row][col] === '#') {
            grid[row][col] = '.';
            virus.direction = turnRight(virus.direction);
        } else {
            grid[row][col] = '#';
            virus.direction = turnLeft(virus.direction);
            infectionCount++;
        }
        virus.position = {
            x: row + virus.direction.x,
            y: col + virus.direction.y,
        };
    }
    console.log(`Part 1: ${infectionCount}`);
}

function solvePart2(input: string) {
    const grid: string[][] = input.split('\n').map(line => line.trim().split(''));
    let virus: VirusPosition = {
        position: {
            x: Math.floor(grid.length / 2),
            y: Math.floor(grid[0].length / 2)
        },
        direction: {
            x: -1,
            y: 0
        }
    };
    let infectionCount = 0;
    for (let i = 0; i < 1e7; i++) {
        let row = virus.position.x;
        let col = virus.position.y;
        grid[row] = grid[row] || [];
        if (grid[row][col] === '#') {
            grid[row][col] = 'F';
            virus.direction = turnRight(virus.direction);
        } else if (grid[row][col] === 'F') {
            grid[row][col] = '.';
            virus.direction = reverse(virus.direction);
        } else if (grid[row][col] === 'W') {
            grid[row][col] = '#';
            infectionCount++;
        } else {
            grid[row][col] = 'W';
            virus.direction = turnLeft(virus.direction);
        }
        virus.position = {
            x: row + virus.direction.x,
            y: col + virus.direction.y,
        };
    }
    console.log(`Part 2: ${infectionCount}`);
}

function turnLeft(direction: Vector): Vector {
    return {
        x: -direction.y,
        y: direction.x
    }
}

function turnRight(direction: Vector): Vector {
    return {
        x: direction.y,
        y: -direction.x
    }
}

function reverse(direction: Vector): Vector {
    return {
        x: -direction.x,
        y: -direction.y
    }
}

findSolution();
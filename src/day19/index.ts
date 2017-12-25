import * as fs from 'mz/fs';

const enum Direction {
    Up,
    Down,
    Left,
    Right
}

interface GraphState {
    x: number;
    y: number;
    direction: Direction;
}

async function findSolution(inputFilePath: string = './input.txt') {
    const input = await fs.readFile(require.resolve(inputFilePath), 'utf8');

    let graph: string[][] = input.split('\n').map(line => line.split(''));

    let state: GraphState = {
        x: graph[0].indexOf('|'),
        y: 0,
        direction: Direction.Down
    };

    let pathLetters: string = '';
    let stepCount = 0;

    while (true) {
        let { x, y } = state;
        let cell = graph[y][x];

        if (cell === '+') {
            // Switch direction
            let { direction } = state;
            if (direction !== Direction.Down && graph[y-1][x] === '|') {
                state.direction = Direction.Up;
            } else if (direction !== Direction.Up && graph[y+1][x] === '|') {
                state.direction = Direction.Down;
            } else if (direction !== Direction.Right && graph[y][x-1] === '-') {
                state.direction = Direction.Left;
            } else if (direction !== Direction.Left && graph[y][x+1] === '-') {
                state.direction = Direction.Right;
            }
        } else if (/\w/.test(cell)) {
            pathLetters += cell;
        } else if (cell === ' ') {
            break;
        }

        switch(state.direction) {
            case Direction.Down:
                state.y++;
                break;
            case Direction.Up:
                state.y--;
                break;
            case Direction.Right:
                state.x++;
                break;
            case Direction.Left:
                state.x--;
                break;
        }

        stepCount++;
    }

    console.log(`Part 1: ${pathLetters}`);
    console.log(`Part 2: ${stepCount}`);
}

findSolution();
import * as fs from 'mz/fs';

async function findSolution(inputFilePath: string = './input.txt') {
    const input = await fs.readFile(require.resolve(inputFilePath), 'utf8');

    const stepCount = parseInt(input);
    let spinlock: Spinlock = {
        buffer: [0],
        position: 0,
    };
    
    for (let i = 1; i <= 2017; i++) {
        let insertionIndex = ((spinlock.position + stepCount) % spinlock.buffer.length) + 1;
        spinlock.buffer.splice(insertionIndex, 0, i);
        spinlock.position = insertionIndex;
    }

    console.log(`Part 1: ${spinlock.buffer[(spinlock.position + 1) % spinlock.buffer.length]}`);

    let valueAfterZero: number;
    let position = 0;
    
    for (let i = 1; i < 50000000; i++) {
        position = (position + stepCount) % i;

        if (position === 0) {
            valueAfterZero = i;
        }

        position++;
    }

    console.log((`Part 2: ${valueAfterZero!}`));
}

interface Spinlock {
    buffer: number[];
    position: number;
}

findSolution();
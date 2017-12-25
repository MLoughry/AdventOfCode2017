import * as fs from 'mz/fs';
import { error } from 'util';

const instructionRegex = /^(snd|set|add|mul|mod|rcv|jgz) (\w|-?\d+)\s?(\w|-?\d+)?$/m;

type Instruction = (program: ProgramState) => void;

interface Registers {
    [register: string]: number | undefined;
    lastTone?: number;
};

interface ProgramState {
    registers: Registers;
    instructionPointer: number;
    instructions: Instruction[];
    programId?: number;
    queue?: number[];
    waiting?: boolean;
    valuesQueued?: number;
}

async function findSolution(inputFilePath: string = './input.txt') {
    const input = await fs.readFile(require.resolve(inputFilePath), 'utf8');

    let program = buildPart1Program(input);
    executePart1Program(program);

    let program0: ProgramState, program1: ProgramState;
    program0 = buildPart2Program(input, 0, (value: number) => {
        program1.queue!.push(value);
        program0.valuesQueued!++;
    });
    program1 = buildPart2Program(input, 1, (value: number) => {
        program0.queue!.push(value);
        program1.valuesQueued!++;
    });

    while (!program0.waiting || program0.queue!.length !== 0 || !program1.waiting || program1.queue!.length !== 0) {
        executePart2Program(program0);
        executePart2Program(program1);
        // console.log(program0);
        // console.log(program1);
    }

    console.log(`Part 2: ${program1.valuesQueued}`);
}

function executePart1Program(program: ProgramState) {
    while (program.instructionPointer >= 0 && program.instructionPointer < program.instructions.length) {
        program.instructions[program.instructionPointer](program);
    }
}

function executePart2Program(program: ProgramState) {
    while (program.instructionPointer >= 0 && program.instructionPointer < program.instructions.length && (!program.waiting || program.queue!.length)) {
        program.instructions[program.instructionPointer](program);
    }
}

function buildPart1Program(input: string) {
    let program: ProgramState = {
        registers: {},
        instructionPointer: 0,
        instructions: input.split('\n').map(line => {
            let matches = instructionRegex.exec(line)!;

            let command = matches[1];
            let x = matches[2];
            let y = matches[3];

            switch (command) {
                case 'snd':
                    return (program: ProgramState) => {
                        program.registers.lastTone = value(x, program);
                        program.instructionPointer++;
                    };
                case 'set':
                    return (program: ProgramState) => {
                        program.registers[x] = value(y, program);
                        program.instructionPointer++;
                    };
                case 'add':
                    return (program: ProgramState) => {
                        program.registers[x] = program.registers[x] || 0;
                        program.registers[x]! += value(y, program);
                        program.instructionPointer++;
                    };
                case 'mul':
                    return (program: ProgramState) => {
                        program.registers[x] = program.registers[x] || 0;
                        program.registers[x]! *= value(y, program);
                        program.instructionPointer++;
                    };
                case 'mod':
                    return (program: ProgramState) => {
                        program.registers[x] = program.registers[x] || 0;
                        program.registers[x]! %= value(y, program);
                        program.instructionPointer++;
                    };
                case 'rcv':
                    return (program: ProgramState) => {
                        if (value(x, program) !== 0) {
                            console.log(`Part 1: ${program.registers.lastTone}`);
                            program.instructionPointer = Number.MIN_SAFE_INTEGER;
                        }
                        program.instructionPointer++;
                    };
                case 'jgz':
                    return (program: ProgramState) => {
                        if (value(x, program) > 0) {
                            program.instructionPointer += value(y, program);
                        } else {
                            program.instructionPointer++;
                        }
                    };
                default:
                    throw new Error('Invalid instruction');
            }
        })
    };

    return program;
}

function buildPart2Program(input: string, id: number, sendFunction: (value: number) => void): ProgramState {
    let program: ProgramState = {
        registers: {
            p: id,
        },
        instructionPointer: 0,
        programId: id,
        queue: [],
        waiting: false,
        valuesQueued: 0,
        instructions: input.split('\n').map(line => {
            let matches = instructionRegex.exec(line)!;

            let command = matches[1];
            let x = matches[2];
            let y = matches[3];

            switch (command) {
                case 'snd':
                    return (program: ProgramState) => {
                        sendFunction(value(x, program));
                        program.instructionPointer++;
                        // console.log(`${program.programId}: ${line}`);
                    };
                case 'set':
                    return (program: ProgramState) => {
                        program.registers[x] = value(y, program);
                        program.instructionPointer++;
                        // console.log(`${program.programId}: ${line}`);
                    };
                case 'add':
                    return (program: ProgramState) => {
                        program.registers[x] = program.registers[x] || 0;
                        program.registers[x]! += value(y, program);
                        program.instructionPointer++;
                        // console.log(`${program.programId}: ${line}`);
                    };
                case 'mul':
                    return (program: ProgramState) => {
                        program.registers[x] = program.registers[x] || 0;
                        program.registers[x]! *= value(y, program);
                        program.instructionPointer++;
                        // console.log(`${program.programId}: ${line}`);
                    };
                case 'mod':
                    return (program: ProgramState) => {
                        program.registers[x] = program.registers[x] || 0;
                        program.registers[x]! %= value(y, program);
                        program.instructionPointer++;
                        // console.log(`${program.programId}: ${line}`);
                    };
                case 'rcv':
                    return (program: ProgramState) => {
                        if (program.queue!.length === 0) {
                            // console.log(`${program.programId} is waiting...`);
                            program.waiting = true;
                        } else {
                            program.waiting = false;
                            program.registers[x] = program.queue!.shift();
                            program.instructionPointer++;
                        }
                        // console.log(`${program.programId}: ${line}`);
                    };
                case 'jgz':
                    return (program: ProgramState) => {
                        if (value(x, program) > 0) {
                            program.instructionPointer += value(y, program);
                        } else {
                            program.instructionPointer++;
                        }
                        // console.log(`${program.programId}: ${line}`);
                    };
                default:
                    throw new Error('Invalid instruction');
            }
        })
    };

    return program;
}

function value(arg: string, program: ProgramState) {
    if (/[a-z]/.test(arg)) {
        return program.registers[arg] = program.registers[arg] || 0;
    } else {
        return parseInt(arg);
    }
}

findSolution();
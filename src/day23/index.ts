import * as fs from 'mz/fs';
import { error } from 'util';

const instructionRegex = /^(set|sub|mul|jnz) (\w|-?\d+)\s?(\w|-?\d+)?$/m;

type Instruction = (program: ProgramState) => void;

interface Registers {
    [register: string]: number | undefined;
};

interface ProgramState {
    registers: Registers;
    instructionPointer: number;
    instructions: Instruction[];
    mulExecutionCount: number;
}

async function findSolution(inputFilePath: string = './input.txt') {
    const input = await fs.readFile(require.resolve(inputFilePath), 'utf8');

    let program = buildPart1Program(input);
    executeProgram(program);

    console.log(`Part 1: ${program.mulExecutionCount}`);

    executePart2();
}

function executeProgram(program: ProgramState) {
    while (program.instructionPointer >= 0 && program.instructionPointer < program.instructions.length) {
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
                case 'set':
                    return (program: ProgramState) => {
                        program.registers[x] = value(y, program);
                        program.instructionPointer++;
                    };
                case 'mul':
                    return (program: ProgramState) => {
                        program.registers[x] = program.registers[x] || 0;
                        program.registers[x]! *= value(y, program);
                        program.mulExecutionCount++;
                        program.instructionPointer++;
                    };
                case 'sub':
                    return (program: ProgramState) => {
                        program.registers[x] = program.registers[x] || 0;
                        program.registers[x]! -= value(y, program);
                        program.instructionPointer++;
                    };
                case 'jnz':
                    return (program: ProgramState) => {
                        if (value(x, program) !== 0) {
                            program.instructionPointer += value(y, program);
                        } else {
                            program.instructionPointer++;
                        }
                    };
                default:
                    throw new Error('Invalid instruction');
            }
        }),
        mulExecutionCount: 0
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

function executePart2() {
    // hard-coded translation of input assembly
    let r = {
        b: 67,
        c: 67,
        d: 0,
        f: 0,
        g: 0,
        h: 0
    }
    r.b = r.b * 100 + 100000
    r.c = r.b + 17000
    do {
        r.f = 1
        r.d = 2
        for (let d = r.d; d * d < r.b; ++d) {
            if (r.b % d === 0) {
                r.f = 0
                break
            }
        }
        if (r.f === 0) r.h++
        r.g = r.b - r.c
        r.b += 17
    } while (r.g !== 0)

    console.log(`Part 2: ${r.h}`);
}

findSolution();
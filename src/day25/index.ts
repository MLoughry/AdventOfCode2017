type TuringMachineState = (machine: TuringMachine) => void;
interface TuringMachine {
    tape: number[];
    cursor: number;
    state: TuringMachineState;
    checksum: number;
}

interface StateTransition {
    write: number,
    move: number,
    state: TuringMachineState,
}

const Left = -1;
const Right = 1;

const states: { [key: string]: TuringMachineState} = {
    a: (machine: TuringMachine) => {
        executeStateTransition(
            machine,
            {
                write: 1,
                move: Right,
                state: states.b,
            },
            {
                write: 0,
                move: Right,
                state: states.f
            }
        )
    },
    b: (machine: TuringMachine) => {
        executeStateTransition(
            machine,
            {
                write: 0,
                move: Left,
                state: states.b,
            },
            {
                write: 1,
                move: Left,
                state: states.c
            }
        )
    },
    c: (machine: TuringMachine) => {
        executeStateTransition(
            machine,
            {
                write: 1,
                move: Left,
                state: states.d,
            },
            {
                write: 0,
                move: Right,
                state: states.c
            }
        )
    },
    d: (machine: TuringMachine) => {
        executeStateTransition(
            machine,
            {
                write: 1,
                move: Left,
                state: states.e,
            },
            {
                write: 1,
                move: Right,
                state: states.a
            }
        )
    },
    e: (machine: TuringMachine) => {
        executeStateTransition(
            machine,
            {
                write: 1,
                move: Left,
                state: states.f,
            },
            {
                write: 0,
                move: Left,
                state: states.d
            }
        )
    },
    f: (machine: TuringMachine) => {
        executeStateTransition(
            machine,
            {
                write: 1,
                move: Right,
                state: states.a,
            },
            {
                write: 0,
                move: Left,
                state: states.e
            }
        )
    },
};

function executeStateTransition(machine: TuringMachine, transitionIfZero: StateTransition, transitionIfOne: StateTransition) {
    if (!machine.tape[machine.cursor]) {
        machine.tape[machine.cursor] = transitionIfZero.write;
        if (transitionIfZero.write) {
            machine.checksum++;
        }
        machine.cursor += transitionIfZero.move;
        machine.state = transitionIfZero.state;
    } else {
        machine.tape[machine.cursor] = transitionIfOne.write;
        if (!transitionIfOne.write) {
            machine.checksum--;
        }
        machine.cursor += transitionIfOne.move;
        machine.state = transitionIfOne.state;
    }
}

function findSolution() {
    let machine: TuringMachine = {
        tape: [],
        cursor: 0,
        state: states.a,
        checksum: 0,
    };

    for (let i = 0; i < 12425180; i++) {
        machine.state(machine);
    }

    console.log(`Part 1: ${machine.checksum}`);
}

findSolution();
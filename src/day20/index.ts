import * as fs from 'mz/fs';

interface Tuple {
    x: number;
    y: number;
    z: number;
}

interface Particle {
    particle: number;
    position: Tuple;
    velocity: Tuple;
    acceleration: Tuple;
}

const particleRegex = /p=<(-?\d+),(-?\d+),(-?\d+)>, v=<(-?\d+),(-?\d+),(-?\d+)>, a=<(-?\d+),(-?\d+),(-?\d+)>/;

async function findSolution(inputFilePath: string = './input.txt') {
    const input = await fs.readFile(require.resolve(inputFilePath), 'utf8');

    let particles: Particle[] = input
        .split('\n')
        .map((line, particleId) => {
            let [
                match,
                px, py, pz,
                vx, vy, vz,
                ax, ay, az
            ] = particleRegex.exec(line)!;

            return {
                particle: particleId,
                position: { x: parseInt(px), y: parseInt(py), z: parseInt(pz) },
                velocity: { x: parseInt(vx), y: parseInt(vy), z: parseInt(vz) },
                acceleration: { x: parseInt(ax), y: parseInt(ay), z: parseInt(az) },
            };
        });

    let closestParticle = particles.reduce((closest, current) => {
        const longTermTime = 1e10;
        let closestLongTermDistance = sumAbsTuple(calcuateParticlePosition(closest, longTermTime));
        let currentLongTermDistance = sumAbsTuple(calcuateParticlePosition(current, longTermTime));

        return closestLongTermDistance < currentLongTermDistance ? closest : current;
    }, particles[0]);

    console.log(`Part 1: ${closestParticle.particle}`);

    for (let stepsWithoutCollision = 0; stepsWithoutCollision < 1e4; stepsWithoutCollision++) {
        if (filterCollidingParticles(particles)) {
            stepsWithoutCollision = 0;
        }
        stepParticles(particles);
    }

    console.log(`Part 2: ${particles.length}`);
}

function sumAbsTuple(tuple: Tuple): number {
    return Math.abs(tuple.x) + Math.abs(tuple.y) + Math.abs(tuple.z);
}

function calcuateParticlePosition(particle: Particle, t: number): Tuple {
    let { position, velocity, acceleration } = particle;

    return {
        x: position.x + velocity.x * t + acceleration.x * t * t,
        y: position.y + velocity.y * t + acceleration.y * t * t,
        z: position.z + velocity.z * t + acceleration.z * t * t,
    }
}

function filterCollidingParticles(particles: Particle[]): boolean {
    particles.sort((a,b) => a.position.x - b.position.x || a.position.y - b.position.y || a.position.z - b.position.z);

    let initialParticleCount = particles.length;
    let current: Tuple = particles[0].position;
    let currentTupleIndex = 0;
    let wasCollision = false;

    for (let i = 1; i < particles.length; i++) {
        if (areSameTuple(current, particles[i].position)) {
            particles.splice(i, 1);
            i--;
            wasCollision = true;
        } else {
            if (wasCollision) {
                particles.splice(currentTupleIndex, 1);
                i--;
            }

            current = particles[i].position;
            currentTupleIndex = i;
            wasCollision = false;
        }
    }

    return initialParticleCount !== particles.length;
}

function stepParticles(particles: Particle[]) {
    particles.forEach(particle => {
        particle.velocity = addTuples(particle.velocity, particle.acceleration);
        particle.position = addTuples(particle.position, particle.velocity);
    });
}

function areSameTuple(a: Tuple, b: Tuple) {
    return a.x === b.x && a.y === b.y && a.z == b.z;
}

function addTuples(a: Tuple, b: Tuple) {
    return {
        x: a.x + b.x,
        y: a.y + b.y,
        z: a.z + b.z,
    }
}

findSolution();
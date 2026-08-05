/**
 * SeededRNG - Deterministic Random Number Generator
 * 
 * Uses xorshift32 algorithm for fast, deterministic pseudo-random numbers.
 * Given the same seed, will always produce the same sequence.
 * 
 * Perfect for blockchain games where the seed comes from a smart contract.
 */
export class SeededRNG {
    private state: number;

    /**
     * Create a new seeded RNG
     * @param seed - uint32 seed from smart contract (1 to 4,294,967,295)
     */
    constructor(seed: number) {
        // xorshift requires non-zero seed
        // Convert to unsigned 32-bit integer
        this.state = seed === 0 ? 1 : seed >>> 0;
    }

    /**
     * Generate next random uint32
     * @returns Random number from 0 to 4,294,967,295
     */
    next(): number {
        let x = this.state;
        x ^= x << 13;
        x ^= x >>> 17;
        x ^= x << 5;
        this.state = x >>> 0; // Keep as uint32
        return x >>> 0;
    }

    /**
     * Generate random float in range [0, 1)
     * @returns Random number from 0 (inclusive) to 1 (exclusive)
     */
    nextFloat(): number {
        return this.next() / 0x100000000; // Divide by 2^32
    }

    /**
     * Generate random integer in range [min, max)
     * @param min - Minimum value (inclusive)
     * @param max - Maximum value (exclusive)
     * @returns Random integer from min to max-1
     */
    nextInt(min: number, max: number): number {
        return min + (this.next() % (max - min));
    }

    /**
     * Generate random boolean
     * @returns Random true or false
     */
    nextBool(): boolean {
        return (this.next() & 1) === 1;
    }

    /**
     * Choose random element from array
     * @param array - Array to choose from
     * @returns Random element
     */
    nextChoice<T>(array: T[]): T {
        return array[this.nextInt(0, array.length)];
    }

    /**
     * Shuffle array in-place (Fisher-Yates)
     * @param array - Array to shuffle
     * @returns The same array, shuffled
     */
    shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = this.nextInt(0, i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Get current internal state (for debugging)
     * @returns Current state value
     */
    getState(): number {
        return this.state;
    }

    /**
     * Reset to a specific state (for debugging/testing)
     * @param state - State to reset to
     */
    setState(state: number): void {
        this.state = state >>> 0;
    }
}

/**
 * Test determinism - run this to verify RNG is working correctly
 * Should print true if deterministic
 */
export function testSeededRNG(): void {
    console.log('🧪 Testing SeededRNG determinism...');
    
    const seed = 12345;
    
    // First run
    const rng1 = new SeededRNG(seed);
    const sequence1 = [
        rng1.next(),
        rng1.nextFloat(),
        rng1.nextInt(1, 100),
        rng1.nextBool(),
    ];
    
    // Second run with same seed
    const rng2 = new SeededRNG(seed);
    const sequence2 = [
        rng2.next(),
        rng2.nextFloat(),
        rng2.nextInt(1, 100),
        rng2.nextBool(),
    ];
    
    const match = JSON.stringify(sequence1) === JSON.stringify(sequence2);
    
    console.log('Sequence 1:', sequence1);
    console.log('Sequence 2:', sequence2);
    console.log('Deterministic:', match ? '✅ YES' : '❌ NO');
    
    if (!match) {
        console.error('⚠️ RNG is not deterministic! This will break replay functionality.');
    }
}

// Run test in development
if (import.meta.env.DEV) {
    testSeededRNG();
}

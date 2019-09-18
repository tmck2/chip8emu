export class Chip8 {
    constructor(display) {
        this.PC = 0;
        this.Stack = [];
        this.Memory = Array(4096);
        this.V = Array(15);
        this.I = 0;
        this.DelayTimer = 0;
        this.SoundTimer = 0;
        this.display = display;
        this.display.clear();
    }

    advanceEmulator() {
    }

    updateTimers() {
    }
}

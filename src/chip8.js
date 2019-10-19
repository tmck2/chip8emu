import {InstructionFactory} from "./instruction";

export class Chip8 {
    constructor(buzzer, keys) {
        this.buzzer = buzzer;
        this.keys = keys;
        this.cyclesPerFrame = 15;
        this.reset();
        this.mainLoop();
    }

    connectDisplay(display) {
        this.display = display;
    }

    load(address, bytes) {
        for(const by in bytes) {
            this.Memory[(address++) & 0xfff] = bytes[by];
        }
    }

    repaint() {
        if (this.display) {
            this.display.repaint();
        }
    }

    reset() {
        this.PC = 0x200;
        this.Stack = [];
        this.Memory = Array(4096).fill(0);
        this.DisplayMemory = Array(8*32).fill(0);
        this.V = Array(16).fill(0);
        this.I = 0;
        this.DT = 0;
        this.ST = 0;
        this.totalEllapsed = 0;
        this.singleStep = true;
        this.repaint();

        // load font into low memory
        this.load(0x0, [
            0xF0, 0x90, 0x90, 0x90, 0xF0,       // 0
            0x20, 0x60, 0x20, 0x20, 0x70,       // 1
            0xF0, 0x10, 0xF0, 0x80, 0xF0,       // 2
            0xF0, 0x10, 0xF0, 0x10, 0xF0,       // 3
            0x90, 0x90, 0xF0, 0x10, 0x10,       // 4
            0xF0, 0x80, 0xF0, 0x10, 0xF0,       // 5
            0xF0, 0x80, 0xF0, 0x90, 0xF0,       // 6
            0xF0, 0x10, 0x20, 0x40, 0x40,       // 7
            0xF0, 0x90, 0xF0, 0x90, 0xF0,       // 8
            0xF0, 0x90, 0xF0, 0x10, 0xF0,       // 9
            0xF0, 0x90, 0xF0, 0x90, 0x90,       // A
            0xE0, 0x90, 0xE0, 0x90, 0xE0,       // B
            0xF0, 0x80, 0x80, 0x80, 0xF0,       // C
            0xE0, 0x90, 0x90, 0x90, 0xE0,       // D
            0xF0, 0x80, 0xF0, 0x80, 0xF0,       // E
            0xF0, 0x80, 0xF0, 0x80, 0x80        // F
        ]);
    }

    disasm(addr, len) {
        const result = [];
        for (let curr=addr; curr < addr+len; curr+=2) {
            let addr1 = curr & 0xfff;
            let addr2 = (curr+1) & 0xfff;

            const machineCode = this.Memory[addr1] << 8 | this.Memory[addr2];
            const instruction = InstructionFactory.createFrom(machineCode);
            result.push((this.PC === curr ? "> " : "  ") + `0x${curr.toString(16)} ${instruction.disasm()}`)
        }
        return result;
    }

    mainLoop() {
        // update timers whether in single step mode or not so that buzzer does not get stuck on
        if (!this.start) this.start = new Date();
        this.updateTimers(new Date() - this.start);

        if (!this.singleStep)
        {
            const n = Math.ceil((new Date() - this.start)/1000) * this.cyclesPerFrame;
            for (let i=0; i<n; i++) {
                this.stepEmulator(new Date()-this.start);
            }
        }

        this.start = new Date();
        requestAnimationFrame(x => this.mainLoop.call(this));
    }

    stepEmulator() {
        if (this.waitingForKey != undefined) {
            let key = [...Array(16).keys()].find(code => this.keys[code]);
            if (key) {
                this.V[this.waitingForKey] = key;
                delete this.waitingForKey;
                this.PC+=2;
            }
            return;
        }

        const instruction = InstructionFactory.createFrom(this.Memory[this.PC] << 8 | this.Memory[(this.PC+1)&0xfff]);

        if (instruction) {
            instruction.exec(this);
        } else {
            console.log("unknown instruction", instruction);
            this.PC += 2;
        }
    }

    updateTimers(ellapsed) {
        if (this.ST > 0) {
            this.buzzer.on();
        } else {
            this.buzzer.off();
        }

        this.totalEllapsed += ellapsed;
        if (this.totalEllapsed > 16) {
            if (this.DT > 0) this.DT--;
            if (this.ST > 0) this.ST--;
            this.totalEllapsed = 0;
        }
    }
}


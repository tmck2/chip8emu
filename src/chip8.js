export class Chip8 {
    constructor(display, keys) {
        this.display = display;
        this.keys = keys;
        this.reset();
    }

    load(address, bytes) {
        for(const by in bytes) {
            this.Memory[address++] = bytes[by];
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
        this.display.repaint(this.DisplayMemory);

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

        // wait routine
        // register a should contain the duration
        this.load(0x050, [
            0xfa, 0x15,         // LD DT, VA
            0xfa, 0x07,         // LD VA, DT
            0x3a, 0x00,         // SE VA, 0
            0x10, 0x52,         // JP 0x052
            0x00, 0xee,
        ]);

        // TODO: remove this little test program
        this.load(0x200, [
            0x60, 0x01,         // 0x200 LD V0, 1
            0x61, 0x0c,         // 0x202 LD V1, $0c
            0xF1, 0x29,         // 0x204 LD F, V1
            0xd0, 0x05,         // 0x206 DRW V0, V0, 5
            0x63, 0x06,         // 0x208 LD V3, $06
            0x61, 0x08,         // 0x20a LD V1, $08
            0xF1, 0x29,         // 0x20c LD F, V1
            0xd3, 0x05,         // 0x20e DRW V3, V0, 5
            0x6a, 0x20,         // 0x210 LD VA, $20
            0x20, 0x50,         // 0x212 Call delay routine
            0x12, 0x00,         // 0x214 JP 0x200
        ]);
    }

    get state() {
        const fmtreg = r => `0x${('00'+r.toString(16)).substr(-2)}`;

        const vregs = [...Array(16).keys()]
            .map(i => `V${i.toString(16)}=${fmtreg(this.V[i])}`)
            .join(" "); 
        const regs = `I=${fmtreg(this.I)} DT=${fmtreg(this.DT)} ST=${fmtreg(this.ST)}`;
        const ins = `0x${('000'+this.PC.toString(16)).substr(-3)} 0x${('00'+this.Memory[this.PC].toString(16)).substr(-2)}${('00'+this.Memory[this.PC+1].toString(16)).substr(-2)}`

        return [vregs, regs, ins].join("\r\n");
    }

    advanceEmulator(ellapsed) {
        const opcode = this.Memory[this.PC] << 8 | this.Memory[this.PC+1];
        const n = opcode & 0x000f;
        const x = (opcode >> 8) & 0x0f;
        const y = (opcode >> 4) & 0x0f;
        const kk = opcode & 0xff;
        const nnn = opcode & 0x0fff;

        switch (opcode & 0xf000) {
            case 0x0000:
                if (opcode === 0x00e0) {
                    this.display.clear();
                } else if (opcode === 0x00ee) {
                    this.PC = this.Stack.pop();
                } else {
                    console.log(`Ignoring Invalid opcode: ${this.opcode}`);
                }
                this.PC += 2;
                break;
            case 0x1000:
                this.PC = nnn;
                break;
            case 0x2000:
                this.Stack.push(this.PC);
                this.PC = nnn;
                break;
            case 0x3000:
                this.PC += (this.V[x] === kk) ? 4 : 2;
                break;
            case 0x4000:
                this.PC += (this.V[x] === kk) ? 2 : 4;
                break;
            case 0x5000:
                this.PC += (this.V[x] === this.V[y]) ? 4 : 2;
                break;
            case 0x6000:
                this.V[x] = kk;
                this.PC += 2;
                break;
            case 0x7000:
                this.V[x] = this.V[x] + kk;
                this.PC += 2;
                break;
            case 0x8000:
                switch (n) {
                    case 0:
                        this.V[x] = this.V[y];
                        this.PC += 2;
                        break;
                    case 1:
                        this.V[x] = this.V[x] | this.V[y];
                        this.PC += 2;
                        break;
                    case 2:
                        this.V[x] = this.V[x] & this.V[y];
                        this.PC += 2;
                        break;
                    case 3:
                        this.V[x] = this.V[x] ^ this.V[y];
                        this.PC += 2;
                        break;
                    case 4:
                        this.V[x] = this.V[x] + this.V[y];
                        this.V[0xf] = (this.V[x] > 255) ? 1 : 0;
                        this.V[x] = this.V[x] & 0xff;
                        this.PC += 2;
                        break;
                    case 5:
                        this.V[0xf] = this.V[y] > this.V[x] ? 1 : 0;
                        this.V[x] = this.V[x] - this.V[y];
                        this.PC += 2;
                        break;
                    case 6:
                        this.V[0xf] = this.V[x] & 1;
                        this.V[x] = this.V[x] >> 1;
                        this.PC += 2;
                        break;
                    case 7:
                        this.V[0xf] = this.V[y] > this.V[x] ? 1 : 0;
                        this.V[x] = this.V[y] - this.V[x];
                        this.PC += 2;
                        break;
                    case 0xE:
                        this.V[0xf] = this.V[x] & 0x80 ? 1 : 0;
                        this.V[x] = this.V[x] << 1;
                        this.PC += 2;
                        break;
                }
                break;
            case 0x9000:
                this.PC += this.V[x] != this.V[y] ? 4 : 2;
                break;
            case 0xA000:
                this.I = nnn;
                this.PC += 2;
                break;
            case 0xB000:
                this.PC = nnn + this.V[0];
                break;
            case 0xC000:
                this.V[x] = Math.floor(Math.random()*255) & kk;
                this.PC += 2;
                break;
            case 0xD000:
                this.V[0xF] = 0;
                for (let row=0; row<n; row++) {
                    let pixel = this.Memory[this.I+row];
                    for (let col=0; col<8; col++) {
                        if((pixel & (0x80 >> col)) != 0) {
                            let by = ((this.V[y] + row) << 3) + (this.V[x] >> 3);
                            let bi = (this.V[x] + col);
                            if (bi > 7) by++;
                            this.DisplayMemory[by] ^= (0x80 >> (bi%8));
                        }
                    }
                }
                this.display.repaint(this.DisplayMemory);
                this.PC += 2;
                break;
            case 0xE000:
                if (kk === 0x9e) {
                    this.PC += (this.keys[this.V[x]]) ? 4 : 2;
                } else if (kk === 0xA1) {
                    this.PC += (this.keys[this.V[x]]) ? 2 : 4;
                } else {
                    throw `Invalid opcode: ${opcode}`;
                }
                break;
            case 0xF000:
                switch (kk) {
                    case 0x07:
                        this.V[x] = this.DT;
                        this.PC += 2;
                        break;
                    case 0x0a:
                        for (;;) {
                            var key = [...Array(16).keys()].find(scancode => this.keys[scancode]);
                            if (key) {
                                this.V[x] = key;
                                break;
                            }
                        }
                        this.PC += 2;
                        break;
                    case 0x15:
                        this.DT = this.V[x];
                        this.PC += 2;
                        break;
                    case 0x18:
                        this.ST = this.V[x];
                        this.PC += 2;
                        break;
                    case 0x1e:
                        this.I = this.I + this.V[x];
                        this.PC += 2;
                        break;
                    case 0x29:
                        this.I = this.V[x] * 5;
                        this.PC += 2;
                        break;
                    case 0x33:
                        this.Memory[this.I]   = (this.V[x] % 1000) / 100; // hundred's
                        this.Memory[this.I+1] = (this.V[x] % 100) / 10;   // ten's
                        this.Memory[this.I+2] = (this.V[x] % 10);         // one's
                        this.PC += 2;
                        break;
                    case 0x55:
                        for (let i=0; i<=x; i++) {
                            this.Memory[this.I+i] = this.V[i];
                        }
                        this.PC += 2;
                        break;
                    case 0x65:
                        for (let i=0; i<=x; i++) {
                            this.V[i] = this.Memory[this.I+i];
                        }
                        this.PC += 2;
                        break;
                    default:
                        throw new `Invalid opcode: ${opcode}`;
                }
        }

        this.updateTimers(ellapsed);
    }

    updateTimers(ellapsed) {
        this.totalEllapsed += ellapsed;
        if (this.totalEllapsed > 16) {
            if (this.DT > 0) this.DT--;
            if (this.ST > 0) this.ST--;
            this.totalEllapsed = 0;
        }
    }
}


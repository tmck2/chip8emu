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
    }

    get state() {
        const fmtreg = function(val, leadingZeros=2) {
             return `${('0'.repeat(leadingZeros)+val.toString(16)).substr(-1*leadingZeros)}`;
        }

        const vregs = [...Array(16).keys()]
            .map(i => `V${i.toString(16)}=0x${fmtreg(this.V[i])}`)
            .join(" "); 
        const regs = `I=0x${fmtreg(this.I,3)} DT=0x${fmtreg(this.DT)} ST=0x${fmtreg(this.ST)}`;
        const ins = `0x${fmtreg(this.PC,3)} 0x${fmtreg(this.Memory[this.PC],2)}${fmtreg(this.Memory[this.PC+1],2)}`

        return [vregs, regs, ins].join("\r\n");
    }

    advanceEmulator(ellapsed) {
        if (this.waitingForKey != undefined) {
            let key = [...Array(16).keys()].find(code => this.keys[code]);
            if (key) {
                this.V[this.waitingForKey] = key;
                delete this.waitingForKey;
                this.PC+=2;
            }
            return;
        }

        const opcode = this.Memory[this.PC] << 8 | this.Memory[this.PC+1];
        const n = opcode & 0x000f;
        const x = (opcode >> 8) & 0x0f;
        const y = (opcode >> 4) & 0x0f;
        const kk = opcode & 0xff;
        const nnn = opcode & 0x0fff;

        switch (opcode & 0xf000) {
            case 0x0000:
                if (opcode === 0x00e0) {
                    this.DisplayMemory = Array(8*32).fill(0);
                    this.display.repaint(this.DisplayMemory);
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
                this.V[x] = (this.V[x] + kk) & 0xff;
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
                        this.V[x] = (this.V[x] - this.V[y]) & 0xff;
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
                            const dstCol = this.V[x];
                            const dstRow = this.V[y];
                            let by = Math.floor((dstRow + row) * 8 + (dstCol + col) / 8);
                            let bi = (dstCol + col) % 8;
                            if (this.DisplayMemory[by] & (0x80 >> bi)) {
                                this.V[0xf] = 1;
                            }
                            this.DisplayMemory[by] ^= (0x80 >> bi);
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
                        this.waitingForKey = x;
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
                        this.Memory[this.I]   = ((this.V[x] % 1000) / 100) & 0xff ; // hundred's
                        this.Memory[this.I+1] = ((this.V[x] % 100) / 10) & 0xff;    // ten's
                        this.Memory[this.I+2] = ((this.V[x] % 10)) & 0xff;          // one's
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


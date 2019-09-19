export class Chip8 {
    constructor(display) {
        this.display = display;
        this.reset();
    }

    load(address, bytes) {
        for(const by in bytes) {
            this.Memory[address++] = by;
        }
    }

    reset() {
        this.PC = 0x200;
        this.Stack = [];
        this.Memory = Array(4096);
        this.V = Array(15);
        this.I = 0;
        this.DelayTimer = 0;
        this.SoundTimer = 0;
        this.display.clear();
    }

    get state() {
        return {
            PC: this.PC,
            Stack: this.Stack,
            V: this.V,
            I: this.I,
            DelayTimer: this.DelayTimer,
            SoundTimer: this.SoundTimer
        }
    }

    advanceEmulator() {
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
                    throw `Invalid opcode: ${this.opcode}`;
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
                //Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
                //The interpreter reads n bytes from memory, starting at the address stored in I. These bytes are then displayed as sprites on screen at coordinates (Vx, Vy). Sprites are XORed onto the existing screen. If this causes any pixels to be erased, VF is set to 1, otherwise it is set to 0. If the sprite is positioned so part of it is outside the coordinates of the display, it wraps around to the opposite side of the screen. See instruction 8xy3 for more information on XOR, and section 2.4, Display, for more information on the Chip-8 screen and sprites.
                this.PC += 2;
                break;
            case 0xE000:
                if (kk === 0x9e) {
                    //Skip next instruction if key with the value of Vx is pressed.
                    //Checks the keyboard, and if the key corresponding to the value of Vx is currently in the down position, PC is increased by 2.
                    this.PC += 2;
                } else if (kk === 0xA1) {
                    //Skip next instruction if key with the value of Vx is not pressed.
                    //Checks the keyboard, and if the key corresponding to the value of Vx is currently in the up position, PC is increased by 2.
                    this.PC += 4;
                } else {
                    throw `Invalid opcode: ${opcode}`;
                }
                break;
            case 0xF000:
                switch (kk) {
                    case 0x07:
                        this.V[x] = this.DelayTimer;
                        this.PC += 2;
                        break;
                    case 0x0a:
                        //Wait for a key press, store the value of the key in Vx.
                        //All execution stops until a key is pressed, then the value of that key is stored in Vx.
                        throw new `Opcode ${opcode} not implemented yet`;
                        this.PC += 2;
                        break;
                    case 0x15:
                        this.DelayTimer = this.V[x];
                        this.PC += 2;
                        break;
                    case 0x18:
                        this.SoundTimer = this.V[x];
                        this.PC += 2;
                        break;
                    case 0x1e:
                        this.I = this.I + this.V[x];
                        this.PC += 2;
                        break;
                    case 0x29:
                        //Set I = location of sprite for digit Vx.
                        //The value of I is set to the location for the hexadecimal sprite corresponding to the value of Vx. See section 2.4, Display, for more information on the Chip-8 hexadecimal font.
                        throw new `Opcode ${opcode} not implemented yet`;
                        this.PC += 2;
                        break;
                    case 0x33:
                        this.Memory[I]   = (this.V[x] % 1000) / 100; // hundred's
                        this.Memory[I+1] = (this.V[x] % 100) / 10;   // ten's
                        this.Memory[I+2] = (this.V[x] % 10);         // one's
                        this.PC += 2;
                        break;
                    case 0x55:
                        for (let i=0; i<=x; i++) {
                            this.Memory[I+i] = this.V[i];
                        }
                        this.PC += 2;
                        break;
                    case 0x65:
                        for (let i=0; i<=x; i++) {
                            this.V[i] = this.Memory[I+i];
                        }
                        this.PC += 2;
                        break;
                    default:
                        throw new `Invalid opcode: ${opcode}`;
                }
        }
    }

    updateTimers() {
    }
}

export class Instruction {
    // isMatch :: Instruction -> n -> kk -> x -> y -> nnn -> bool
    // disasm :: n -> kk -> x -> y -> nnn -> string
    // exec :: Chip8 -> ()
    constructor(mnemonic, isMatch, disasm, exec) {
        this.mnemonic = mnemonic;
        this.isMatch = isMatch;
        this.disasm = disasm;
        this.exec = exec;
    }
}

export class InstructionFactory {
    static createFrom(machineCode) {
        const n = machineCode & 0x000f;
        const x = (machineCode >> 8) & 0x0f;
        const y = (machineCode >> 4) & 0x0f;
        const kk = machineCode & 0xff;
        const nnn = machineCode & 0x0fff;

        const args = { n, x, y, kk, nnn };

        const instruction = this._instructions.find(x => x.isMatch({machineCode,n,x,y,kk,nnn}));
        if (!instruction) {
            return {
                disasm: () => `0x${machineCode.toString(16)}`,
                exec: chip => { console.log(`Unknown opcode: ${machineCode}`); chip.PC += 2; }
            };
        }

        return {
            disasm: () => instruction.disasm(args),
            exec: chip => {
                instruction.exec(chip, args);
                chip.PC &= 0xfff;
            }
        };
    }

    static _instructions = [
        new Instruction('CLS',          x => x.machineCode === 0x00e0,                            _ => 'CLS',                          (chip, x) => this.cls(chip, x)),
        new Instruction('RET',          x => x.machineCode === 0x00ee,                            _ => 'RET',                          (chip, x) => this.ret(chip, x)),
        new Instruction('SYS nnn',      x => (x.machineCode & 0xf000) === 0x0000,                 x => `SYS 0x${x.nnn.toString(16)}`,                 (chip, x) => this.sys_nnn(chip, x)),
        new Instruction('JP nnn',       x => (x.machineCode & 0xf000) === 0x1000,                 x => `JP 0x${x.nnn.toString(16)}`,                  (chip, x) => this.jp_nnn(chip, x)),
        new Instruction('CALL nnn',     x => (x.machineCode & 0xf000) === 0x2000,                 x => `CALL 0x${x.nnn.toString(16)}`,                (chip, x) => this.call_nnn(chip, x)),
        new Instruction('SE Vx, kk',    x => (x.machineCode & 0xf000) === 0x3000,                 x => `SE V${x.x.toString(16)}, 0x${x.kk.toString(16)}`,          (chip, x) => this.se_Vx_kk(chip, x)),
        new Instruction('SNE Vx, kk',   x => (x.machineCode & 0xf000) === 0x4000,                 x => `SNE V${x.x.toString(16)}, 0x${x.kk.toString(16)}`,         (chip, x) => this.sne_Vx_kk(chip, x)),
        new Instruction('SE Vx, Vy',    x => (x.machineCode & 0xf000) === 0x5000,                 x => `SE V${x.x.toString(16)}, 0xV${x.y.toString(16)}`,          (chip, x) => this.se_Vx_Vy(chip, x)),
        new Instruction('LD Vx, kk',    x => (x.machineCode & 0xf000) === 0x6000,                 x => `LD V${x.x.toString(16)}, 0x${x.kk.toString(16)}`,          (chip, x) => this.ld_Vx_kk(chip, x)),
        new Instruction('ADD Vx, kk',   x => (x.machineCode & 0xf000) === 0x7000,                 x => `ADD V${x.x.toString(16)}, 0x${x.kk.toString(16)}`,         (chip, x) => this.add_Vx_kk(chip, x)),
        new Instruction('LD Vx, Vy',    x => (x.machineCode & 0xf000) === 0x8000 && x.n === 0,    x => `LD V${x.x.toString(16)}, V${x.y.toString(16)}`,          (chip, x) => this.ld_Vx_Vy(chip, x)),
        new Instruction('OR Vx, Vy',    x => (x.machineCode & 0xf000) === 0x8000 && x.n === 1,    x => `OR V${x.x.toString(16)}, V${x.y.toString(16)}`,          (chip, x) => this.or_Vx_Vy(chip, x)),
        new Instruction('AND Vx, Vy',   x => (x.machineCode & 0xf000) === 0x8000 && x.n === 2,    x => `AND V${x.x.toString(16)}, V${x.y.toString(16)}`,         (chip, x) => this.and_Vx_Vy(chip, x)),
        new Instruction('XOR Vx, Vy',   x => (x.machineCode & 0xf000) === 0x8000 && x.n === 3,    x => `XOR V${x.x.toString(16)}, V${x.y.toString(16)}`,         (chip, x) => this.xor_Vx_Vy(chip, x)),
        new Instruction('ADD Vx, Vy',   x => (x.machineCode & 0xf000) === 0x8000 && x.n === 4,    x => `ADD V${x.x.toString(16)}, V${x.y.toString(16)}`,         (chip, x) => this.add_Vx_Vy(chip, x)),
        new Instruction('SUB Vx, Vy',   x => (x.machineCode & 0xf000) === 0x8000 && x.n === 5,    x => `SUB V${x.x.toString(16)}, V${x.y.toString(16)}`,         (chip, x) => this.sub_Vx_Vy(chip, x)),
        new Instruction('SHR Vx',       x => (x.machineCode & 0xf000) === 0x8000 && x.n === 6,    x => `SHR V${x.x.toString(16)}`,                  (chip, x) => this.shr_Vx(chip, x)),
        new Instruction('SUBN Vx, Vy',  x => (x.machineCode & 0xf000) === 0x8000 && x.n === 7,    x => `SUBN V${x.x.toString(16)}, V${x.y.toString(16)}`,       (chip, x) => this.subn_Vx_Vy(chip, x)),
        new Instruction('SHL Vx',       x => (x.machineCode & 0xf000) === 0x8000 && x.n === 0xe,  x => `SHL V${x.x.toString(16)}`,                  (chip, x) => this.shl_Vx(chip, x)),
        new Instruction('SNE Vx, Vy',   x => (x.machineCode & 0xf000) === 0x9000,                 x => `SNE V${x.x.toString(16)}, V${x.y.toString(16)}`,         (chip, x) => this.sne_Vx_Vy(chip, x)),
        new Instruction('LD I, nnn',    x => (x.machineCode & 0xf000) === 0xa000,                 x => `LD I, 0x${x.nnn.toString(16)}`,               (chip, x) => this.ld_I_nnn(chip, x),
        new Instruction('JP V0, nnn',   x => (x.machineCode & 0xf000) === 0xb000,                 x => `JP V0, 0x${x.nnn.toString(16)}`,              (chip, x) => this.jp_V0_nnn(chip, x))),
        new Instruction('RND Vx, kk',   x => (x.machineCode & 0xf000) === 0xc000,                 x => `RND V${x.x.toString(16)}, 0x${x.kk.toString(16)}`,         (chip, x) => this.rnd_Vx_kk(chip, x)),
        new Instruction('DRW Vx, Vy, n',x => (x.machineCode & 0xf000) === 0xd000,                 x => `DRW V${x.x.toString(16)}, V${x.y.toString(16)}, 0x${x.n.toString(16)}`, (chip, x) => this.drw_Vx_Vy(chip, x)),
        new Instruction('SKP Vx',       x => (x.machineCode & 0xf000) === 0xe000 && x.kk == 0x9e, x => `SKP V${x.x.toString(16)}`,                  (chip, x) => this.skp_Vx(chip, x)),
        new Instruction('SKNP Vx',      x => (x.machineCode & 0xf000) === 0xe000 && x.kk == 0xa1, x => `SKNP V${x.x.toString(16)}`,                 (chip, x) => this.sknp_Vx(chip, x)),
        new Instruction('LD Vx, DT',    x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x07, x => `LD V${x.x.toString(16)}, DT`,               (chip, x) => this.ld_Vx_DT(chip, x)),
        new Instruction('LD Vx, K',     x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x0a, x => `LD V${x.x.toString(16)}, K`,                (chip, x) => this.ld_Vx_K(chip, x)),
        new Instruction('LD DT, Vx',    x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x15, x => `LD DT, V${x.x.toString(16)}`,               (chip, x) => this.ld_DT_Vx(chip, x)),
        new Instruction('LD ST, Vx',    x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x18, x => `LD ST, V${x.x.toString(16)}`,               (chip, x) => this.ld_ST_Vx(chip, x)),
        new Instruction('ADD I, Vx',    x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x1e, x => `ADD I, V${x.x.toString(16)}`,               (chip, x) => this.add_I_Vx(chip, x)),
        new Instruction('LD F, Vx',     x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x29, x => `LD F, V${x.x.toString(16)}`,                (chip, x) => this.ld_F_Vx(chip, x)),
        new Instruction('LD B, Vx',     x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x33, x => `LD B, V${x.x.toString(16)}`,                (chip, x) => this.ld_B_Vx(chip, x)),
        new Instruction('LD [I], Vx',   x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x55, x => `LD [I], V${x.x.toString(16)}`,              (chip, x) => this.ld_I_Vx(chip, x)),
        new Instruction('LD Vx, [I]',   x => (x.machineCode & 0xf000) === 0xf000 && x.kk == 0x65, x => `LD V${x.x.toString(16)}, [I]`,              (chip, x) => this.ld_Vx_I(chip, x)),
    ];

    static cls(chip) {
        chip.DisplayMemory = Array(8*32).fill(0);
        chip.repaint();
        chip.PC += 2;
    }

    static ret(chip) {
        chip.PC = chip.Stack.pop();
        chip.PC += 2;
    }

    static sys_nnn(chip, x) {
        chip.PC += 2;
    }

    static jp_nnn(chip, x) {
        chip.PC = x.nnn;
    }

    static call_nnn(chip, x) {
        chip.Stack.push(chip.PC);
        chip.PC = x.nnn;
    }

    static se_Vx_kk(chip, x) {
        chip.PC += (chip.V[x.x] === x.kk) ? 4 : 2;
    }

    static se_Vx_Vy(chip, x) {
        chip.PC += (chip.V[x.x] === chip.V[x.y]) ? 4 : 2;
    }

    static sne_Vx_kk(chip, x) {
        chip.PC += (chip.V[x.x] === x.kk) ? 2 : 4;
    }

    static add_Vx_kk(chip, x) {
        chip.V[x.x] = (chip.V[x.x] + x.kk) & 0xff;
        chip.PC += 2;
    }

    static add_Vx_Vy(chip, x) {
        chip.V[x.x] = chip.V[x.x] + chip.V[x.y];
        chip.V[0xf] = (chip.V[x.x] > 255) ? 1 : 0;
        chip.V[x.x] = chip.V[x.x] & 0xff;
        chip.PC += 2;
    }

    static sub_Vx_Vy(chip, x) {
        chip.V[0xf] = chip.V[x.y] > chip.V[x.x] ? 1 : 0;
        chip.V[x.x] = (chip.V[x.x] - chip.V[x.y]) & 0xff;
        chip.PC += 2;
    }

    static shr_Vx(chip, x) {
        chip.V[0xf] = chip.V[x.x] & 1;
        chip.V[x.x] = chip.V[x.x] >> 1;
        chip.PC += 2;
    }

    static subn_Vx_Vy(chip, x) {
        chip.V[0xf] = chip.V[x.y] > chip.V[x.x] ? 1 : 0;
        chip.V[x.x] = chip.V[x.y] - chip.V[x.x];
        chip.PC += 2;
    }

    static shl_Vx(chip, x) {
        chip.V[0xf] = chip.V[x.x] & 0x80 ? 1 : 0;
        chip.V[x.x] = chip.V[x.x] << 1;
        chip.PC += 2;
    }

    static ld_Vx_kk(chip, x) {
        chip.V[x.x]=x.kk;
        chip.PC+=2;
    }

    static ld_Vx_Vy(chip, x) {
        chip.V[x.x] = chip.V[x.y];
        chip.PC += 2
    }

    static or_Vx_Vy(chip, x) {
        chip.V[x.x] |= chip.V[x.y];
        chip.PC += 2
    }

    static and_Vx_Vy(chip, x) {
        chip.V[x.x] &= chip.V[x.y];
        chip.PC += 2
    }

    static xor_Vx_Vy(chip, x) {
        chip.V[x.x] ^= chip.V[x.y];
        chip.PC += 2
    }

    static sne_Vx_Vy(chip, x) {
        chip.PC += chip.V[x.x] != chip.V[x.y] ? 4 : 2;
    }

    static ld_I_nnn(chip, x) {
        chip.I = x.nnn;
        chip.PC += 2;
    }

    static jp_V0_nnn(chip, x) {
        chip.PC = x.nnn + chip.V[0];
    }

    static rnd_Vx_kk(chip, x) {
        chip.V[x.x] = Math.floor(Math.random()*255) & x.kk;
        chip.PC += 2;
    }

    static drw_Vx_Vy(chip, x) {
        chip.V[0xF] = 0;
        for (let row=0; row<x.n; row++) {
            let pixel = chip.Memory[chip.I+row];
            for (let col=0; col<8; col++) {
                if((pixel & (0x80 >> col)) != 0) {
                    const dstCol = chip.V[x.x] & 0x3f;
                    const dstRow = chip.V[x.y];
                    let by = Math.floor((dstRow + row) * 8 + (dstCol + col) / 8);
                    let bi = (dstCol + col) % 8;
                    if (chip.DisplayMemory[by] & (0x80 >> bi)) {
                        chip.V[0xf] = 1;
                    }
                    chip.DisplayMemory[by] ^= (0x80 >> bi);
                }
            }
        }
        chip.repaint();
        chip.PC += 2;
    }

    static skp_Vx(chip, x) {
        chip.PC += (chip.keys[chip.V[x.x]]) ? 4 : 2;
    }

    static sknp_Vx(chip, x) {
        chip.PC += (chip.keys[chip.V[x.x]]) ? 2 : 4;
    }

    static ld_Vx_DT(chip, x) {
        chip.V[x.x] = chip.DT;
        chip.PC += 2;
    }

    static ld_Vx_K(chip, x) {
        chip.waitingForKey = x.x;
    }

    static ld_DT_Vx(chip, x) {
        chip.DT = chip.V[x.x];
        chip.PC += 2;
    }

    static ld_ST_Vx(chip, x) {
        chip.ST = chip.V[x.x];
        chip.PC += 2;
    }

    static add_I_Vx(chip, x) {
        chip.I = chip.I + chip.V[x.x];
        chip.PC += 2;
    }

    static ld_F_Vx(chip, x) {
        chip.I = chip.V[x.x] * 5;
        chip.PC += 2;
    }

    static ld_B_Vx(chip, x) {
        chip.Memory[chip.I]   = ((chip.V[x.x] % 1000) / 100) & 0xff ; // hundred's
        chip.Memory[chip.I+1] = ((chip.V[x.x] % 100) / 10) & 0xff;    // ten's
        chip.Memory[chip.I+2] = ((chip.V[x.x] % 10)) & 0xff;          // one's
        chip.PC += 2;
    }

    static ld_I_Vx(chip, x) {
        for (let i=0; i<=x.x; i++) {
            chip.Memory[chip.I+i] = chip.V[i];
        }
        chip.PC += 2;
    }

    static ld_Vx_I(chip, x) {
        for (let i=0; i<=x.x; i++) {
            chip.V[i] = chip.Memory[chip.I+i];
        }
        chip.PC += 2;
    }
}
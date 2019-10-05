class OpCode {
    // isMatch :: opcode -> n -> kk -> x -> y -> nnn -> bool
    // disasm :: n -> kk -> x -> y -> nnn -> string
    // exec :: Chip8 -> ()
    constructor(mnemonic, isMatch, disasm, exec) {
        this.mnemonic = mnemonic;
        this.isMatch = isMatch;
        this.disasm = disasm;
        this.exec = exec;
    }
}

export class Chip8 {
    constructor(buzzer, keys) {
        this.buzzer = buzzer;
        this.keys = keys;
        this.cyclesPerFrame = 15;
        this.reset();
        this.go();

        this._ops = [
            new OpCode('CLS',          x => x.opcode === 0x00e0,                            _ => 'CLS',                       x => this.cls.call(this,x)),
            new OpCode('RET',          x => x.opcode === 0x00ee,                            _ => 'RET',                       x => this.ret.call(this,x)),
            new OpCode('SYS nnn',      x => (x.opcode & 0xf000) === 0x0000,                 x => `SYS ${x.nnn}`,              x => this.sys_nnn.call(this,x)),
            new OpCode('JP nnn',       x => (x.opcode & 0xf000) === 0x1000,                 x => `JP ${x.nnn}`,               x => this.jp_nnn.call(this,x)),
            new OpCode('CALL nnn',     x => (x.opcode & 0xf000) === 0x2000,                 x => `CALL ${x.nnn}`,             x => this.call_nnn.call(this,x)),
            new OpCode('SE Vx, kk',    x => (x.opcode & 0xf000) === 0x3000,                 x => `SE V${x.x}, ${x.kk}`,       x => this.se_Vx_kk.call(this,x)),
            new OpCode('SNE Vx, kk',   x => (x.opcode & 0xf000) === 0x4000,                 x => `SNE V${x.x}, ${x.kk}`,      x => this.sne_Vx_kk.call(this,x)),
            new OpCode('SE Vx, Vy',    x => (x.opcode & 0xf000) === 0x5000,                 x => `SE V${x.x}, $V{x.y}`,       x => this.se_Vx_Vy.call(this,x)),
            new OpCode('LD Vx, kk',    x => (x.opcode & 0xf000) === 0x6000,                 x => `LD V${x.x}, ${x.kk}`,       x => this.ld_Vx_kk.call(this,x)),
            new OpCode('ADD Vx, kk',   x => (x.opcode & 0xf000) === 0x7000,                 x => `ADD V${x.x}, ${x.kk}`,      x => this.add_Vx_kk.call(this,x)),
            new OpCode('LD Vx, Vy',    x => (x.opcode & 0xf000) === 0x8000 && x.n === 0,    x => `LD V${x.x}, V${x.y}`,       x => this.ld_Vx_Vy.call(this,x)),
            new OpCode('OR Vx, Vy',    x => (x.opcode & 0xf000) === 0x8000 && x.n === 1,    x => `OR V${x.x}, V${x.y}`,       x => this.or_Vx_Vy.call(this,x)),
            new OpCode('AND Vx, Vy',   x => (x.opcode & 0xf000) === 0x8000 && x.n === 2,    x => `AND V${x.x}, V${x.y}`,      x => this.and_Vx_Vy.call(this,x)),
            new OpCode('XOR Vx, Vy',   x => (x.opcode & 0xf000) === 0x8000 && x.n === 3,    x => `XOR V${x.x}, V${x.y}`,      x => this.xor_Vx_Vy.call(this,x)),
            new OpCode('ADD Vx, Vy',   x => (x.opcode & 0xf000) === 0x8000 && x.n === 4,    x => `ADD V${x.x}, V${x.y}`,      x => this.add_Vx_Vy.call(this,x)),
            new OpCode('SUB Vx, Vy',   x => (x.opcode & 0xf000) === 0x8000 && x.n === 5,    x => `SUB V${x.x}, V${x.y}`,      x => this.sub_Vx_Vy.call(this,x)),
            new OpCode('SHR Vx',       x => (x.opcode & 0xf000) === 0x8000 && x.n === 6,    x => `SHR V${x.x}`,               x => this.shr_Vx.call(this,x)),
            new OpCode('SUBN Vx, Vy',  x => (x.opcode & 0xf000) === 0x8000 && x.n === 7,    x => `SUBN V${x.x }, V${x.y}`,    x => this.subn_Vx_Vy.call(this,x)),
            new OpCode('SHL Vx',       x => (x.opcode & 0xf000) === 0x8000 && x.n === 0xe,  x => `SHL V${x.x}`,               x => this.shl_Vx.call(this,x)),
            new OpCode('SNE Vx, Vy',   x => (x.opcode & 0xf000) === 0x9000,                 x => `SNE V${x.x}, V${x.y}`,      x => this.sne_Vx_Vy.call(this,x)),
            new OpCode('LD I, nnn',    x => (x.opcode & 0xf000) === 0xa000,                 x => `LD I, ${x.nnn}`,            x => this.ld_I_nnn.call(this,x),
            new OpCode('JP V0, nnn',   x => (x.opcode & 0xf000) === 0xb000,                 x => `JP V0, ${x.nnn}`,           x => this.jp_V0_nnn.call(this,x))),
            new OpCode('RND Vx, kk',   x => (x.opcode & 0xf000) === 0xc000,                 x => `RND V${x.x}, ${x.kk}`,      x => this.rnd_Vx_kk.call(this,x)),
            new OpCode('DRW Vx, Vy, n',x => (x.opcode & 0xf000) === 0xd000,                 x => `DRW V${x.x}, V${x.y}, ${x.n}`, x => this.drw_Vx_Vy.call(this,x)),
            new OpCode('SKP Vx',       x => (x.opcode & 0xf000) === 0xe000 && x.kk == 0x9e, x => `SKP V${x.x}`,               x => this.skp_Vx.call(this,x)),
            new OpCode('SKNP Vx',      x => (x.opcode & 0xf000) === 0xe000 && x.kk == 0xa1, x => `SKNP V${x.x}`,              x => this.sknp_Vx.call(this,x)),
            new OpCode('LD Vx, DT',    x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x07, x => `LD V${x.x}, DT`,            x => this.ld_Vx_DT.call(this,x)),
            new OpCode('LD Vx, K',     x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x0a, x => `LD V${x.x}, K`,             x => this.ld_Vx_K.call(this,x)),
            new OpCode('LD DT, Vx',    x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x15, x => `LD DT, V${x.x}`,            x => this.ld_DT_Vx.call(this,x)),
            new OpCode('LD ST, Vx',    x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x18, x => `LD ST, V${x.x}`,            x => this.ld_ST_Vx.call(this,x)),
            new OpCode('ADD I, Vx',    x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x1e, x => `ADD I, V${x.x}`,            x => this.add_I_Vx.call(this,x)),
            new OpCode('LD F, Vx',     x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x29, x => `LD F, V${x.x}`,             x => this.ld_F_Vx.call(this,x)),
            new OpCode('LD B, Vx',     x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x33, x => `LD B, V${x.x}`,             x => this.ld_B_Vx.call(this,x)),
            new OpCode('LD [I], Vx',   x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x55, x => `LD [I], V${x.x}`,           x => this.ld_I_Vx.call(this,x)),
            new OpCode('LD Vx, [I]',   x => (x.opcode & 0xf000) === 0xf000 && x.kk == 0x65, x => `LD V${x.x}, [I}`,           x => this.ld_Vx_I.call(this,x)),
        ];
    }

    connectDisplay(display) {
        this.display = display;
    }

    load(address, bytes) {
        for(const by in bytes) {
            this.Memory[address++] = bytes[by];
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

    get state() {
        const fmtreg = function(val, leadingZeros=2) {
             return `${('0'.repeat(leadingZeros)+val.toString(16)).substr(-1*leadingZeros)}`;
        }

        const vregs = [...Array(16).keys()]
            .map(i => `V${i.toString(16)}=0x${fmtreg(this.V[i])}`)
            .join(" "); 
        const regs = `I=0x${fmtreg(this.I,3)} DT=0x${fmtreg(this.DT)} ST=0x${fmtreg(this.ST)}`;
        const ins = `${this.disasm(this.PC,1)[0]}`

        return [vregs, regs, ins].join("\r\n");
    }

    disasm(addr, len) {
        const result = [];
        for (let curr=addr; curr < addr+len; curr+=2) {
            let addr1 = curr & 0xfff;
            let addr2 = (curr+1) & 0xfff;

            const opcode = this.Memory[addr1] << 8 | this.Memory[addr2];
            const n = opcode & 0x000f;
            const x = (opcode >> 8) & 0x0f;
            const y = (opcode >> 4) & 0x0f;
            const kk = opcode & 0xff;
            const nnn = opcode & 0x0fff;

            window.ops = this._ops;
            let op = this._ops.find(x => x.isMatch({opcode,n,x,y,kk,nnn}));
            if (op) {
                result.push(`0x${curr.toString(16)} ${op.disasm({n,kk,x,y,nnn})}`)
            } else {
                result.push(`0x${curr.toString(16)} 0x${this.Memory[addr1].toString(16)} 0x${this.Memory[addr2].toString(16)}`)
            }
        }
        return result;
    }

    go() {
        // update timers whether in single step mode or not so that buzzer does not get stuck on
        if (!this.start) this.start = new Date();
        this.updateTimers(new Date() - this.start);

        if (!this.singleStep)
        {
            for (let i=0; i<this.cyclesPerFrame; i++) {
                this.stepEmulator(new Date()-this.start);
            }
        }

        this.start = new Date();
        setTimeout(x => this.go.call(this), 0);
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

        let instruction = this.fetch(this.PC);

        window.ops = this._ops;
        let op = this._ops.find(x => x.isMatch(instruction));
        if (op) {
            op.exec(instruction);
        } else {
            console.log("unknown instruction", instruction);
            this.PC += 2;
        }
    }

    fetch(addr) {
        const opcode = this.Memory[addr] << 8 | this.Memory[(addr+1)&0xfff];
        const n = opcode & 0x000f;
        const x = (opcode >> 8) & 0x0f;
        const y = (opcode >> 4) & 0x0f;
        const kk = opcode & 0xff;
        const nnn = opcode & 0x0fff;

        return { opcode, n, x, y, kk, nnn };
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

    cls() {
        this.DisplayMemory = Array(8*32).fill(0);
        this.repaint();
        this.PC += 2;
    }

    ret() {
        this.PC = this.Stack.pop();
        this.PC += 2;
    }

    sys_nnn(x) {
        console.log(`Ignoring unimplemented opcode: SYS ${x.nnn}`)
        this.PC += 2;
    }

    jp_nnn(x) {
        this.PC = x.nnn;
    }

    call_nnn(x) {
        this.Stack.push(this.PC);
        this.PC = x.nnn;
    }

    se_Vx_kk(x) {
        this.PC += (this.V[x.x] === x.kk) ? 4 : 2;
    }

    se_Vx_Vy(x) {
        this.PC += (this.V[x.x] === this.V[x.y]) ? 4 : 2;
    }

    sne_Vx_kk(x) {
        this.PC += (this.V[x.x] === x.kk) ? 2 : 4;
    }

    add_Vx_kk(x) {
        this.V[x.x] = (this.V[x.x] + x.kk) & 0xff;
        this.PC += 2;
    }

    add_Vx_Vy(x) {
        this.V[x.x] = this.V[x.x] + this.V[x.y];
        this.V[0xf] = (this.V[x.x] > 255) ? 1 : 0;
        this.V[x.x] = this.V[x.x] & 0xff;
        this.PC += 2;
    }

    sub_Vx_Vy(x) {
        this.V[0xf] = this.V[x.y] > this.V[x.x] ? 1 : 0;
        this.V[x.x] = (this.V[x.x] - this.V[x.y]) & 0xff;
        this.PC += 2;
    }

    shr_Vx(x) {
        this.V[0xf] = this.V[x.x] & 1;
        this.V[x.x] = this.V[x.x] >> 1;
        this.PC += 2;
    }

    subn_Vx_Vy(x) {
        this.V[0xf] = this.V[x.y] > this.V[x.x] ? 1 : 0;
        this.V[x.x] = this.V[x.y] - this.V[x.x];
        this.PC += 2;
    }

    shl_Vx(x) {
        this.V[0xf] = this.V[x.x] & 0x80 ? 1 : 0;
        this.V[x.x] = this.V[x.x] << 1;
        this.PC += 2;
    }

    ld_Vx_kk(x) {
        this.V[x.x]=x.kk;
        this.PC+=2;
    }

    ld_Vx_Vy(x) {
        this.V[x.x] = this.V[x.y];
        this.PC += 2
    }

    or_Vx_Vy(x) {
        this.V[x.x] |= this.V[x.y];
        this.PC += 2
    }

    and_Vx_Vy(x) {
        this.V[x.x] &= this.V[x.y];
        this.PC += 2
    }

    xor_Vx_Vy(x) {
        this.V[x.x] ^= this.V[x.y];
        this.PC += 2
    }

    sne_Vx_Vy(x) {
        this.PC += this.V[x.x] != this.V[x.y] ? 4 : 2;
    }

    ld_I_nnn(x) {
        this.I = x.nnn;
        this.PC += 2;
    }

    jp_V0_nnn(x) {
        this.PC = x.nnn + this.V[0];
    }

    rnd_Vx_kk(x) {
        this.V[x.x] = Math.floor(Math.random()*255) & x.kk;
        this.PC += 2;
    }

    drw_Vx_Vy(x) {
        this.V[0xF] = 0;
        for (let row=0; row<x.n; row++) {
            let pixel = this.Memory[this.I+row];
            for (let col=0; col<8; col++) {
                if((pixel & (0x80 >> col)) != 0) {
                    const dstCol = this.V[x.x];
                    const dstRow = this.V[x.y];
                    let by = Math.floor((dstRow + row) * 8 + (dstCol + col) / 8);
                    let bi = (dstCol + col) % 8;
                    if (this.DisplayMemory[by] & (0x80 >> bi)) {
                        this.V[0xf] = 1;
                    }
                    this.DisplayMemory[by] ^= (0x80 >> bi);
                }
            }
        }
        this.repaint();
        this.PC += 2;
    }

    skp_Vx(x) {
        this.PC += (this.keys[this.V[x.x]]) ? 4 : 2;
    }

    sknp_Vx(x) {
        this.PC += (this.keys[this.V[x.x]]) ? 2 : 4;
    }

    ld_Vx_DT(x) {
        this.V[x.x] = this.DT;
        this.PC += 2;
    }

    ld_Vx_K(x) {
        this.waitingForKey = x.x;
    }

    ld_DT_Vx(x) {
        this.DT = this.V[x.x];
        this.PC += 2;
    }

    ld_ST_Vx(x) {
        this.ST = this.V[x.x];
        this.PC += 2;
    }

    add_I_Vx(x) {
        this.I = this.I + this.V[x.x];
        this.PC += 2;
    }

    ld_F_Vx(x) {
        this.I = this.V[x.x] * 5;
        this.PC += 2;
    }

    ld_B_Vx(x) {
        this.Memory[this.I]   = ((this.V[x.x] % 1000) / 100) & 0xff ; // hundred's
        this.Memory[this.I+1] = ((this.V[x.x] % 100) / 10) & 0xff;    // ten's
        this.Memory[this.I+2] = ((this.V[x.x] % 10)) & 0xff;          // one's
        this.PC += 2;
    }

    ld_I_Vx(x) {
        for (let i=0; i<=x.x; i++) {
            this.Memory[this.I+i] = this.V[i];
        }
        this.PC += 2;
    }

    ld_Vx_I(x) {
        for (let i=0; i<=x.x; i++) {
            this.V[i] = this.Memory[this.I+i];
        }
        this.PC += 2;
    }
}


import peg from 'pegjs';

export class Assembler {
    parse(str) {
        const fmt_word = (val) => {
            return [(val & 0xff00) >> 8, val & 0x00ff];
        }

        return fetch('chip8.pegjs')
            .then(response => response.text())
            .then(grammar => {
                const parser = peg.generate(grammar);

                return parser.parse(str);
            })
            .then(x => {
                const {labels, statements} = x;
                return statements
                    .filter(stmt => !stmt.name)
                    .reduce((acc, stmt) => {
                        switch (stmt.ins) {
                            case 'cls':
                                return acc.concat([0x00, 0xe0]);
                            case 'ret':
                                return acc.concat([0x00, 0xee]);
                            case 'jp':
                                if (stmt.arg1.typ === 'vreg' && stmt.arg1.val === 0 && stmt.arg2.typ === 'int') {
                                    return acc.concat(fmt_word(0xb000 | addr));
                                } else {
                                    let addr;
                                    if (!Number.isInteger(stmt.arg1))
                                        addr = labels[stmt.arg1];
                                    return acc.concat(fmt_word(0x1000 | addr));
                                }
                            case 'call':
                                let addr;
                                if (!Number.isInteger(stmt.arg1))
                                    addr = labels[stmt.arg1];
                                return acc.concat(fmt_word(0x2000 | addr));
                            case 'se':
                                if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'int') {
                                    return acc.concat(
                                        fmt_word(0x3000 | stmt.arg1.val << 8 | stmt.arg2.val)
                                    );
                                } else if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0x5000 | stmt.arg1.val << 8 | stmt.arg2.val << 4)
                                    );
                                } else {
                                    throw `error: ${stmt}`;
                                }
                            case 'sne':
                                if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'int') {
                                    return acc.concat(
                                        fmt_word(0x4000 | stmt.arg1.val << 8 | stmt.arg2.val)
                                    );
                                } else if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'int') {
                                    return acc.concat(
                                        fmt_word(0x9000 | stmt.arg1.val << 8 | stmt.arg2.val << 4)
                                    );
                                } else {
                                    throw `error: ${stmt}`;
                                }
                            case 'ld':
                                if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'int') {
                                    return acc.concat(
                                        fmt_word(0x6000 | stmt.arg1.val << 8 | stmt.arg2.val)
                                    );
                                } else if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0x8000 | stmt.arg1.val << 8 | stmt.arg2.val << 4)
                                    );
                                } else if (stmt.arg1.typ === 'ireg') {
                                    const addr = stmt.arg2.typ ? stmt.arg2.val : labels[stmt.arg2];
                                    return acc.concat(fmt_word(0xa000 | addr));
                                } else if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'dt') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg1.val << 8 | 0x07)
                                    );
                                } else if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'k') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg1.val << 8 | 0x0a)
                                    );
                                } else if (stmt.arg1.typ === 'dt' && stmt.arg2.typ === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg2.val << 8 | 0x15)
                                    );
                                } else if (stmt.arg1.typ === 'st' && stmt.arg2.typ === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg2.val << 8 | 0x18)
                                    );
                                } else if (stmt.arg1.typ === 'f' && stmt.arg2.typ === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg2.val << 8 | 0x29)
                                    );
                                } else if (stmt.arg1.typ === 'b' && stmt.arg2.typ === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg2.val << 8 | 0x33)
                                    );
                                } else if (stmt.arg1.typ === 'ind' && stmt.arg2.typ === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg2.val << 8 | 0x55)
                                    );
                                } else if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'ind') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg1.val << 8 | 0x65)
                                    );
                                } else {
                                    throw `error: ${stmt}`;
                                }
                                break;
                            case 'sub':
                                return acc.concat(
                                    fmt_word(0x8000 | stmt.arg1.val << 8 | stmt.arg2.val << 4 | 5)
                                );
                            case 'add':
                                if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'int') {
                                    return acc.concat(
                                        fmt_word(0x7000 | stmt.arg1.val << 8 | stmt.arg2.val)
                                    );
                                } else if (stmt.arg1.typ === 'vreg' && stmt.arg2.typ === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0x8000 | stmt.arg1.val << 8 | stmt.arg2.val << 4 | 4)
                                    );
                                } else if (stmt.arg1.typ === 'I' && stmt.arg2 === 'vreg') {
                                    return acc.concat(
                                        fmt_word(0xf000 | stmt.arg2.val << 8 | 0x1e)
                                    );
                                } else {
                                    throw `error: ${stmt}`;
                                }
                                break;
                            case 'or':
                                return acc.concat(
                                    fmt_word(0x8000 | stmt.arg1.val << 8 | stmt.arg2.val << 4 | 1)
                                );
                            case 'and':
                                return acc.concat(
                                    fmt_word(0x8000 | stmt.arg1.val << 8 | stmt.arg2.val << 4 | 2)
                                );
                            case 'xor':
                                return acc.concat(
                                    fmt_word(0x8000 | stmt.arg1.val << 8 | stmt.arg2.val << 4 | 3)
                                );
                            case 'shr':
                                return acc.concat(
                                    fmt_word(0x8000 | stmt.arg1.val << 8 | 6)
                                );
                            case 'shl':
                                return acc.concat(
                                    fmt_word(0x8000 | stmt.arg1.val << 8 | 0xe)
                                );
                            case 'subn':
                                return acc.concat(
                                    fmt_word(0x8000 | stmt.arg1.val << 8 | stmt.arg2.val << 4 | 7)
                                );
                            case 'rnd':
                                return acc.concat(
                                    fmt_word(0xc000 | stmt.arg1.val << 8 | stmt.arg2.val)
                                );
                            case 'drw':
                                return acc.concat(
                                    fmt_word(0xd000 | stmt.arg1.val << 8 | stmt.arg2.val << 4
                                        | stmt.arg3.val)
                                );
                            case 'skp':
                                return acc.concat(
                                    fmt_word(0xe000 | stmt.arg1.val << 8 | 0x9e)
                                );
                            case 'sknp':
                                return acc.concat(
                                    fmt_word(0xe000 | stmt.arg1.val << 8 | 0xa1)
                                )
                            case 'db':
                                return acc.concat(stmt.arg1.val);
                        }}, []);
            })
            .then(x => {
                console.log(x.map(y => '$' + ('00' + y.toString(16)).substr(-2)));
                return x;
            });
    }
}

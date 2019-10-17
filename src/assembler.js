import peg from 'pegjs';

export class Assembler {
    fmt_word(val) {
        return [(val & 0xff00) >> 8, val & 0x00ff];
    }

    parse(str) {
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
                        console.log(stmt);
                        switch (stmt.ins) {
                            case 'cls':
                                return acc.concat([0x00, 0xe0]);
                            case 'ret':
                                return acc.concat([0x00, 0xee]);
                            case 'jp':
                                let addr;
                                if (!Number.isInteger(stmt.arg1))
                                    addr = labels[stmt.arg1];
                                return acc.concat(this.fmt_word(0x1000 | addr));
                            case 'call':
                                return acc.concat(this.fmt_word(0x2000 | stmt.arg1));
                            case 'se':
                                if (stmt.arg1[0] === 'reg' && stmt.arg2[0] === 'int') {
                                    return acc.concat(
                                        this.fmt_word(0x3000 | stmt.arg1[1] << 8 | stmt.arg2[1])
                                    );
                                } else if (stmt.arg1[0] === 'reg' && stmt.arg2[0] === 'reg') {
                                    return acc.concat(
                                        this.fmt_word(0x5000 | stmt.arg1[1] << 8 | stmt.arg2[1] << 4)
                                    );
                                }
                                return acc;
                            case 'sne':
                                if (stmt.arg1[0] === 'reg' && stmt.arg2[0] === 'int') {
                                    return acc.concat(
                                        this.fmt_word(0x4000 | stmt.arg1[1] << 8 | stmt.arg2[1])
                                    );
                                }
                                break;
                            case 'ld':
                                if (stmt.arg1[0] === 'reg' && stmt.arg2[0] === 'int') {
                                    return acc.concat(
                                        this.fmt_word(0x6000 | stmt.arg1[1] << 8 | stmt.arg2[1])
                                    );
                                }
                                break;
                            case 'sub':
                                return acc.concat(
                                    this.fmt_word(0x8005 | stmt.arg1[1] << 8 | stmt.arg2[1] << 4)
                                );
                                break;
                        }}, []);
            })
            .then(x => {
                console.log(x.map(y => '$' + ('00' + y.toString(16)).substr(-2)));
                return x;
            });
    }
}

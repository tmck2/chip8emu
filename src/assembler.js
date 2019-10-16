import peg from 'pegjs';

export class Assembler {
    parse(str) {
        return fetch('chip8.pegjs')
            .then(response => response.text())
            .then(grammar => {
                const parser = peg.generate(grammar);

                return parser.parse(str);
            })
            .then(console.log);
    }
}

import peg from 'pegjs';

export class Assembler {
    parse(str) {
        return fetch('chip8.pegjs')
            .then(response => response.text())
            .then(grammar => {
                const parser = peg.generate(grammar);

                return parser.parse(str);
            })
            .then(x => {
                console.log(x); 
                return x;
            })
            .then(x => {
                const {labels,statements} = x;
                statements
                    .filter(x => !x.name) // TODO: find a better way to filter labels
                    .forEach(statement => {
                        console.log(statement);
                    });
            });
    }
}

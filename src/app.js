import { Display } from './display';
import { Buzzer } from './buzzer';
import { keys } from './keys';
import { Chip8 } from './chip8';

const games = [
    { name: "F8Z", url: "roms/f8z.ch8" },
    { name: "Tetris", url: "roms/TETRIS.dms" },
    { name: "Invaders", url: "roms/INVADERS.dms" },
    { name: "Floppy Bird", url: "roms/floppybird.rom" },
    { name: "Lunar Lander", url: "roms/lunar_lander.ch8" }
];

let cancelToken;

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');
const buzzer = new Buzzer();

const chip = new Chip8(new Display(ctx), buzzer, keys);

// expose chip for debugging purposes
window.buzzer = buzzer;
window.chip = chip;

games.map(g => {
    let option = document.createElement("option");
    option.text = g.name;
    option.value = g.url;
    return option;
}).forEach(o => {
    document.getElementById("program-select").append(o);
});

document.getElementById("load-button")
    .addEventListener("click", e => {
        const url = document.getElementById("program-select").value;
        if (url) {
            buzzer.init();
            loadProgram(url);
        }
    });

document.getElementById('speed').addEventListener('input', e => {
    chip.cyclesPerFrame = e.target.value;
});

function loadProgram(url) {
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    chip.singleStep = true;

    oReq.onload = function(_) {
        clearTimeout(cancelToken);

        let arrayBuffer = oReq.response;
        if (arrayBuffer) {
            let program = new Uint8Array(arrayBuffer);
            chip.reset();
            chip.load(0x200, program);
            chip.singleStep = false;
        }
    };

    oReq.send(null);
}

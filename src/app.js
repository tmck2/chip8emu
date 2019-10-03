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
]

let cancelToken;

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

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
            loadProgram(url);
        }
    });

function loadProgram(url) {
    var oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    window.chip = new Chip8(new Display(ctx),
        new Buzzer(new (window.AudioContext || window.webkitAudioContext)),
        keys);

    oReq.onload = function(_) {
        console.log("1");
        clearTimeout(cancelToken);

        let arrayBuffer = oReq.response;
        if (arrayBuffer) {
            let program = new Uint8Array(arrayBuffer);
            chip.reset();
            chip.load(0x200, program);
            cancelToken = setTimeout(mainloop, 0);
        }
    };

    oReq.send(null);
}

let start;
function mainloop() {
    for (let i=0; i<100; i++) {
        if (!start) start = new Date();

        chip.advanceEmulator(new Date()-start);

        start = new Date();
    }

    cancelToken = setTimeout(mainloop, 0);
}


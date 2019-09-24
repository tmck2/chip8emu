import { Display } from './display';
import { Chip8 } from './chip8';

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

const keys = Array(16).fill(0);

window.chip = new Chip8(new Display(ctx), keys);

var oReq = new XMLHttpRequest();
oReq.open("GET", "TETRIS.dms", true);
oReq.responseType = "arraybuffer";

oReq.onload = function(_) {
    let arrayBuffer = oReq.response;
    if (arrayBuffer) {
        let program = new Uint8Array(arrayBuffer);
        window.chip.load(0x200, program);
        setTimeout(mainloop, 0);
    }
};

oReq.send(null);

let start;
function mainloop() {
    if (!start) start = new Date();

    window.chip.advanceEmulator(new Date()-start);

    start = new Date();

    setTimeout(mainloop, 0);
}

const keymap = [];
keymap[49] = 0x1;
keymap[50] = 0x2;
keymap[51] = 0x3;
keymap[52] = 0xC;
keymap[81] = 0x4;
keymap[87] = 0x5;
keymap[69] = 0x6;
keymap[82] = 0xD;
keymap[65] = 0x7;
keymap[83] = 0x8;
keymap[68] = 0x9;
keymap[70] = 0xE;
keymap[90] = 0xA;
keymap[88] = 0x0;
keymap[67] = 0xB;
keymap[86] = 0xF;

document.addEventListener('keydown', e => {
    if (keymap[e.keyCode]) {
        keys[keymap[e.keyCode]] = 1;
    }
});

document.addEventListener('keyup', e => {
    if (keymap[e.keyCode]) {
        keys[keymap[e.keyCode]] = 0;
    }
});

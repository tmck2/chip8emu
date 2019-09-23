import { Display } from './display';
import { Chip8 } from './chip8';

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

const keys = Array(16);

window.chip = new Chip8(new Display(ctx), keys);

var oReq = new XMLHttpRequest();
oReq.open("GET", "test_opcode.ch8", true);
oReq.responseType = "arraybuffer";

oReq.onload = function(_) {
    let arrayBuffer = oReq.response;
    if (arrayBuffer) {
        let program = new Uint8Array(arrayBuffer);
        window.chip.load(0x200, program);
        //setTimeout(mainloop, 0);
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



import { Display } from './display';
import { Chip8 } from './chip8';

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

const keys = Array(16);

const chip = new Chip8(new Display(ctx), keys);

function mainloop(timestamp) {
    chip.advanceEmulator();

    window.requestAnimationFrame(mainloop);
}

window.requestAnimationFrame(mainloop);

import { Display } from './display';
import { Chip8 } from './chip8';

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

window.chip = new Chip8(new Display(ctx));


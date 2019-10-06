import React from 'react';
import ReactDOM from 'react-dom';
import { Buzzer } from './buzzer';
import { keys } from './keys';
import { Chip8 } from './chip8';
import { Display } from './display';
import { ControlPanel } from "./controlPanel";

const programs = [
    { name: "F8Z", url: "roms/f8z.ch8" },
    { name: "Tetris", url: "roms/TETRIS.dms" },
    { name: "Invaders", url: "roms/INVADERS.dms" },
    { name: "Floppy Bird", url: "roms/floppybird.rom" },
    { name: "Lunar Lander", url: "roms/lunar_lander.ch8" }
];

const background = {r: 0x9b, g: 0xbc, b: 0x0f };
const foregroundColor = "#000";
const displayWidth = 320;
const displayHeight = 320;

class Disasm extends React.Component {
    xo = 8;
    yo = 12;
    cy = 12;

    constructor(props) {
        super(props);

        this.chip = props.chip;
    }

    fmtval = function(val, leadingZeros=2) {
        return `${('0'.repeat(leadingZeros)+val.toString(16)).substr(-1*leadingZeros)}`;
    };

    repaint = () => {
        this.ctx.fillStyle = this.grad;
        this.ctx.fillRect(0, 0, displayWidth, displayHeight);

        this.ctx.font = `${this.cy}px monospace`;
        this.ctx.fillStyle = foregroundColor;

        for (let j=0; j<16; j++) {
            this.ctx.fillText(`V${j.toString(16)}=0x${this.fmtval(this.chip.V[j])}`, this.xo + (j%6) * 52, this.yo + Math.floor(j/6) * this.cy);
        }

        this.ctx.fillText(`I=0x${this.fmtval(this.chip.I,3)} DT=0x${this.fmtval(this.chip.DT)} ST=0x${this.fmtval(this.chip.ST)}`, this.xo, this.yo + this.cy * 4);

        let instructions = this.chip.disasm(Math.max(this.chip.PC - 16, 0), Math.min(this.chip.PC + 40, 4096) - this.chip.PC);
        if (instructions) {
            instructions.forEach((str, ix) => {
                this.ctx.fillText(`${str}`, this.xo, this.cy * 6 + this.yo + ix * this.cy);
            });
        }
    }

    componentDidMount() {
        this.ctx = this.refs.display.getContext('2d');

        this.grad = this.ctx.createLinearGradient(0, 0, 0, displayHeight);
        this.grad.addColorStop(0.0, `rgba(${background.r},${background.g},${background.b},1)`);
        this.grad.addColorStop(1.0, `rgba(${background.r * 0.8},${background.g * 0.8},${background.b * 0.8},1)`);

        this.timer = setInterval(this.repaint, 0);
    }

    componentWillUnmount() {
        clearTimeout(this.timer);
    }

    render() {
        return <canvas id="disasm-display" ref="display" width={displayWidth} height={displayHeight}></canvas>;
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);

        this.buzzer = new Buzzer();
        this.chip = new Chip8(this.buzzer, keys);

        window.chip = this.chip;
    }

    loadProgram = (url) => {
        if (!url) return;
        const oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        this.chip.singleStep = true;

        oReq.onload = _ => {
            let arrayBuffer = oReq.response;
            if (arrayBuffer) {
                let program = new Uint8Array(arrayBuffer);
                this.chip.reset();
                this.chip.load(0x200, program);
            }
        };

        oReq.send(null);
    }

    go = () => { this.chip.singleStep = false; };

    break = () => { this.chip.singleStep = true; };

    step = () => { this.chip.stepEmulator(); };

    updateSpeed = (cyclesPerFrame) => {
        this.chip.cyclesPerFrame = cyclesPerFrame;
    }

    render() {
       return (
            <div>
               <Display chip={this.chip} />
               <Disasm chip={this.chip} />
               <ControlPanel programs={programs} loadProgram={this.loadProgram} speedChanged={this.updateSpeed} onGo={this.go} onBreak={this.break} onStep={this.step} />
           </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('app'));


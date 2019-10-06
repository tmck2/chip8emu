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

class App extends React.Component {
    constructor(props) {
        super(props);

        this.buzzer = new Buzzer();
        this.chip = new Chip8(this.buzzer, keys);
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
                this.chip.singleStep = false;
            }
        };

        oReq.send(null);
    }

    updateSpeed = (cyclesPerFrame) => {
        this.chip.cyclesPerFrame = cyclesPerFrame;
    }

    render() {
       return (
            <div>
               <Display chip={this.chip} />
               <ControlPanel programs={programs} loadProgram={this.loadProgram} speedChanged={this.updateSpeed} />
           </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('app'));


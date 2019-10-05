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

const buzzer = new Buzzer();
const chip = new Chip8(buzzer, keys);

// for debugging
window.chip = chip;

const loadProgram = url => {
    if (!url) return;
    const oReq = new XMLHttpRequest();
    oReq.open("GET", url, true);
    oReq.responseType = "arraybuffer";

    chip.singleStep = true;

    oReq.onload = _ => {
        let arrayBuffer = oReq.response;
        if (arrayBuffer) {
            let program = new Uint8Array(arrayBuffer);
            chip.reset();
            chip.load(0x200, program);
            chip.singleStep = false;
        }
    };

    oReq.send(null);
};

const updateSpeed = cyclesPerFrame => {
    chip.cyclesPerFrame = cyclesPerFrame;
};

class App extends React.Component {
    constructor(props) {
        super(props);

        this.chip = this.props.chip;
        this.buzzer = this.props.buzzer;
    }

    render() {
       return (
            <div>
               <Display chip={chip} />
               <ControlPanel programs={programs} loadProgram={loadProgram} speedChanged={updateSpeed} />
           </div>);
    }
}

ReactDOM.render(<App onLoadProgram={loadProgram} buzzer={buzzer} />, document.getElementById('app'));


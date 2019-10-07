import React from 'react';
import ReactDOM from 'react-dom';
import {Buzzer} from './buzzer';
import {keys} from './keys';
import {Chip8} from './chip8';
import {Display} from './display';
import {ControlPanel} from "./controlPanel";
import {Monitor} from "./monitor";

const programs = [
    { name: "Tetris",      url: "roms/TETRIS.dms",     speed: 15,  instructions: "W - Left, E - Right, Q - Rotate, A - Drop" },
    { name: "Invaders",    url: "roms/INVADERS.dms",   speed: 50,  instructions: "Q - Left, E - Right, W - Shoot" },
    { name: "Floppy Bird", url: "roms/floppybird.rom", speed: 50,  instructions: "W - Flap" },
    { name: "F8Z",         url: "roms/f8z.ch8",        speed: 100, instructions: "A - Left, D - Right" },
    { name: "Blinky",      url: "roms/BLINKY.dms",     speed: 50,  instructions: "A - Left, S - Right, 3 - Up, E - Down, V - Continue" }
];

class App extends React.Component {
    constructor(props) {
        super(props);

        this.buzzer = new Buzzer();
        this.chip = new Chip8(this.buzzer, keys);

        // for debugging
        window.chip = this.chip;

        this.state = {selectedProgram: 0, speed: 15};
    }

    loadProgram = () => {
        const program = programs[this.state.selectedProgram];

        const oReq = new XMLHttpRequest();
        oReq.open("GET", program.url, true);
        oReq.responseType = "arraybuffer";

        this.chip.singleStep = true;

        this.updateSpeed(program.speed || 50);

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
        this.setState({speed: cyclesPerFrame});
    }

    render() {
       return (
            <div>
               <ControlPanel
                    programs={programs}
                    selectedProgram={this.state.selectedProgram}
                    onProgramSelected={ix => this.setState({selectedProgram:ix})}
                    onLoadProgram={this.loadProgram}
                    speed={this.state.speed}
                    speedChanged={this.updateSpeed}
                    onGo={this.go}
                    onBreak={this.break}
                    onStep={this.step} />
               <Display chip={this.chip} />
               <Monitor chip={this.chip} />
           </div>);
    }
}

ReactDOM.render(<App />, document.getElementById('app'));


import React from 'react';
import { createRoot } from 'react-dom/client'
import {Buzzer} from './buzzer';
import {keys} from './keys';
import {Chip8} from './chip8';
import {Display} from './display';
import {ControlPanel} from "./controlPanel";
import {Monitor} from "./monitor";
import {Assembler} from "./assembler";

require('file-loader?name=[name].[ext]!../index.html');
require('./app.css');
require('./roms.js');

window.assembler = new Assembler();

const programs = [
    { name: "Tetris",                url: "roms/TETRIS.dms",     speed: 15,  instructions: "W - Left, E - Right, Q - Rotate, A - Drop" },
    { name: "Invaders",              url: "roms/INVADERS.dms",   speed: 50,  instructions: "Q - Left, E - Right, W - Shoot" },
    { name: "Floppy Bird",           url: "roms/floppybird.rom", speed: 50,  instructions: "W - Flap" },
    { name: "F8Z",                   url: "roms/f8z.ch8",        speed: 100, instructions: "A - Left, D - Right" },
    { name: "Blinky",                url: "roms/BLINKY.dms",     speed: 15,  instructions: "A - Left, S - Right, 3 - Up, E - Down, V - Continue" },
    { name: "Byte Magazine Example", url: "roms/bytemagex.ch8",  speed: 3,   instructions: "The example game from 1976 Byte Magazine Volume 3 Number 12.  Press V to launch rocket."}
];

class App extends React.Component {
    constructor(props) {
        super(props);

        this.buzzer = new Buzzer();
        this.chip = new Chip8(this.buzzer, keys);
        this.programSource = "";

        // for debugging
        window.chip = this.chip;

        this.state = {selectedProgram: undefined, speed: 15, showMonitor: true};
    }

    loadProgram = (ix) => {
        if (!ix) return;

        this.setState({selectedProgram: ix});
        const program = programs[ix];

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
                this.chip.singleStep = false;
            }
        };

        oReq.send(null);
    };

    go = () => { this.chip.singleStep = false; };

    break = () => { this.chip.singleStep = true; };

    step = () => { this.chip.stepEmulator(); };

    reset = () => {
        this.chip.reset();
        this.setState({selectedProgram:undefined});
    };

    updateSpeed = (cyclesPerFrame) => {
        this.chip.cyclesPerFrame = cyclesPerFrame;
        this.setState({speed: cyclesPerFrame});
    };

    assembleProgram = () => {
        const assembler = new Assembler();
        assembler
            .parse(this.state.programSource)
            .then(prg => {
                this.chip.Memory.splice(0x200, prg.length, ...prg);
            })
            .catch(e => {
                if (e.location) {
                    const {line,column} = e.location.start;
                    alert(`${line}:${column}: ${e.message}`)
                } else {
                    alert(e.message);
                }
            });
    }

    programChanged = e => {
        this.setState({programSource: e.target.value});
    }

    render() {
       const program = this.state.selectedProgram ? programs[this.state.selectedProgram] : {name: 'Chip8 Emulator', instructions: 'Select a program from the title bar above.' };

       return (
            <div>
               <ControlPanel
                    programs={programs}
                    selectedProgram={this.state.selectedProgram}
                    onProgramSelected={this.loadProgram}
                    speed={this.state.speed}
                    speedChanged={this.updateSpeed}
                    onGo={this.go}
                    onBreak={this.break}
                    onStep={this.step}
                    onReset={this.reset}
                    toggleMonitor={_ => this.setState({showMonitor:!this.state.showMonitor})}/>
                <div id="content">
                    <h1>{program.name}</h1>
                    <hr />
                    <p>{program.instructions}</p>
                    <div id="emulator-container">
                       <Display chip={this.chip} />
                       {this.state.showMonitor && <Monitor chip={this.chip} />}
                    </div>
                    <button onClick={this.assembleProgram}>^ ^ ^</button>
                    <div>
                        <textarea
                            cols={80}
                            rows={20}
                            value={this.state.program}
                            onChange={this.programChanged}
                            placeholder='Enter program here and press button above to assemble at address 0x200'
                        />
                    </div>
               </div>
            </div>);
    }
}

const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);


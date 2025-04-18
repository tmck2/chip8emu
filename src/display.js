import React from "react";

const background = {r: 0x9b, g: 0xbc, b: 0x0f };
const foregroundColor = "#0f380f";
const displayWidth = 640;
const displayHeight = 320;
const cols = 64;
const rows = 32;
const blockWidth = displayWidth / cols;
const blockHeight = displayHeight / rows;

export class Display extends React.Component {
    constructor(props) {
        super(props);

        this.display = React.createRef();
        this.chip = props.chip;
    }

    repaint() {
        const mem = this.chip.DisplayMemory;

        this.ctx.fillStyle = this.grad;
        this.ctx.fillRect(0, 0, displayWidth, displayHeight);

        for (let y=0; y<rows; y++)
        {
            for (let x=0; x<(cols>>3); x++)
            {
                for (let i=0; i<8; i++) {
                    if(mem[y*8+x] & (0x80 >> i)) {
                        this.ctx.fillStyle = foregroundColor;
                        this.ctx.fillRect((x*8+i)*blockWidth, y*blockHeight, blockWidth, blockHeight);
                    }
                }
            }
        }
    }

    componentDidMount() {
        this.ctx = this.display.current.getContext('2d');

        this.grad = this.ctx.createLinearGradient(0, 0, 0, displayHeight);
        this.grad.addColorStop(0.0, `rgba(${background.r},${background.g},${background.b},1)`);
        this.grad.addColorStop(1.0, `rgba(${background.r * 0.8},${background.g * 0.8},${background.b * 0.8},1)`);

        this.chip.connectDisplay(this);
        this.repaint();
    }

    render() {
        return <canvas id="emu-display" ref={this.display} width={displayWidth} height={displayHeight}></canvas>;
    }
}


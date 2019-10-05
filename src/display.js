import React from "react";

const backgroundColor = "#9bbc0f";
const foregroundColor = "#10203c";
const displayWidth = 640;
const displayHeight = 320;
const cols = 64;
const rows = 32;
const blockWidth = displayWidth / cols;
const blockHeight = displayHeight / rows;

export class Display extends React.Component {
    constructor(props) {
        super(props);

        this.chip = props.chip;
    }

    repaint() {
        const mem = this.chip.DisplayMemory;

        for (let y=0; y<rows; y++)
        {
            for (let x=0; x<(cols>>3); x++)
            {
                for (let i=0; i<8; i++) {
                    if(mem[y*8+x] & (0x80 >> i)) {
                        this.ctx.fillStyle = foregroundColor;
                    } else {
                        this.ctx.fillStyle = backgroundColor;
                    }
                    this.ctx.fillRect((x*8+i)*blockWidth, y*blockHeight, blockWidth, blockHeight);
                }
            }
        }
    }

    componentDidMount() {
        this.ctx = this.refs.display.getContext('2d');

        this.chip.connectDisplay(this);
        this.repaint();
    }

    render() {
        return <canvas ref="display" width={displayWidth} height={displayHeight}></canvas>;
    }
}


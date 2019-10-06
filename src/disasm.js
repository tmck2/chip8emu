import React from "react";

const background = {r: 0x9b, g: 0xbc, b: 0x0f };
const foregroundColor = "#000";
const displayWidth = 320;
const displayHeight = 320;

export class Disasm extends React.Component {
    xo = 8;
    yo = 12;
    cy = 12;

    constructor(props) {
        super(props);

        this.chip = props.chip;
    }

    fmtval = function (val, leadingZeros = 2) {
        return `${('0'.repeat(leadingZeros) + val.toString(16)).substr(-1 * leadingZeros)}`;
    };

    repaint = () => {
        this.ctx.fillStyle = this.grad;
        this.ctx.fillRect(0, 0, displayWidth, displayHeight);

        this.ctx.font = `${this.cy}px monospace`;
        this.ctx.fillStyle = foregroundColor;

        for (let j = 0; j < 16; j++) {
            this.ctx.fillText(`V${j.toString(16)}=0x${this.fmtval(this.chip.V[j])}`, this.xo + (j % 6) * 52, this.yo + Math.floor(j / 6) * this.cy);
        }

        this.ctx.fillText(`I=0x${this.fmtval(this.chip.I, 3)} DT=0x${this.fmtval(this.chip.DT)} ST=0x${this.fmtval(this.chip.ST)}`, this.xo, this.yo + this.cy * 4);

        let instructions = this.chip.disasm(Math.max(this.chip.PC - 20, 0), Math.min(this.chip.PC + 40, 4096 + 20) - this.chip.PC);
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
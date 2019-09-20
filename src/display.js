const backgroundColor = "#10203c";
const foregroundColor = "#ddd";
const width = 64;
const height = 32;

export class Display {
    constructor(ctx) {
        this.ctx = ctx;
    }

    clear() {
        this.ctx.fillStyle = backgroundColor;
        this.ctx.fillRect(0, 0, width, height);
    }

    togglePixel(row, col) {
        this.ctx.fillStyle = foregroundColor;
        this.ctx.fillRect(row, col, 1, 1);
    }
}


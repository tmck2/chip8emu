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
        this.ctx.fillRect(0, 0, width*16, height*16);
    }

    togglePixel(row, col) {
        this.ctx.fillStyle = foregroundColor;
        this.ctx.fillRect(col*16, row*16, 16, 16);
    }
}


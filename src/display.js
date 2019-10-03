const backgroundColor = "#9bbc0f";
const foregroundColor = "#10203c";
const width = 64;
const height = 32;

export class Display {
    constructor(ctx) {
        this.ctx = ctx;
    }

    repaint(mem) {
        for (let y=0; y<height; y++)
        {
            for (let x=0; x<(width>>3); x++)
            {
                for (let i=0; i<8; i++) {
                    if(mem[y*8+x] & (0x80 >> i)) {
                        this.ctx.fillStyle = foregroundColor;
                    } else {
                        this.ctx.fillStyle = backgroundColor;
                    }
                    this.ctx.fillRect((x*8+i)*16, y*16, 16, 16);
                }
            }
        }
    }
}


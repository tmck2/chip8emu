export const keys = Array(16).fill(0);

const keymap = [];
keymap[49] = 0x1; keymap[50] = 0x2; keymap[51] = 0x3; keymap[52] = 0xC;
keymap[81] = 0x4; keymap[87] = 0x5; keymap[69] = 0x6; keymap[82] = 0xD;
keymap[65] = 0x7; keymap[83] = 0x8; keymap[68] = 0x9; keymap[70] = 0xE;
keymap[90] = 0xA; keymap[88] = 0x0; keymap[67] = 0xB; keymap[86] = 0xF;

document.addEventListener('keydown', e => {
    if (keymap[e.keyCode]) {
        keys[keymap[e.keyCode]] = 1;
    }
});

document.addEventListener('keyup', e => {
    if (keymap[e.keyCode]) {
        keys[keymap[e.keyCode]] = 0;
    }
});

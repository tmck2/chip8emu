# Chip8 Emulator

## Description
This is an emulator for the Chip8 architecture. Information about the Chip8 architecture may be found here: http://devernay.free.fr/hacks/chip8/C8TECH10.HTM

## Instructions

> npm run start

Pick a game and click load

The Chip8 keys:

<pre>
<code>
1 2 3 C
4 5 6 D
7 8 9 E
A 0 B F
</code>
</pre>

Are mapped to the PC keybaord as follows:

<pre>
<code>
1 2 3 4
Q W E R
A S D F
Z X C V
</code>
</pre>

## Assembler

You can assemble code into memory. Just enter code in the window at the bottom of the page and click the "^ ^ ^" button located directly above it.  Checkout Cowgod's Chip-8 Technical Reference [here](http://devernay.free.fr/hacks/chip8/C8TECH10.HTM) for an exhaustive list of instructions. Here's a little hello world program that you can copy and paste in if you just want to try it out:

<pre>
<code>
ld v4, 16
ld v5, 63
ld v6, $a
loop:
    ld i, image
    drw v5, v4, 5
    call delay
    drw v5, v4, 5
    ld v0, 1
    sub v5, v0
    ld v0, $3f
    and v5, v0
    jp loop

delay:
    ld v0, $4
    ld dt, v0
dloop:
    ld v0, dt
    se v0, 0
    jp dloop
    ret

image:
    db $fc
    db $84
    db $84
    db $84
    db $fc
</code>
</pre>

## TODO
* Fix sound
* Allow remapping of keys

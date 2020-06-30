# Chip8 Emulator

[Try It Out!](http://planettonster.com/chip8)

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

Another sample program I've written that you can copy and paste into the assembler window:

<pre>
<code>
; tinysketch.ch8
;
; I wrote this tiny utility to draw graphics for Chip-8 games.
; Drive around using 'w','a','s','d' and update pixel by pressing 'e'.
;
; There's currently no way to save your work other than to manually extract the bytes in your browser's console
; doing something like the following:
;   > chip8.DisplayMemory

ld v4, 0  ; x cursor position
ld v5, 0  ; y cursor position
ld v6, 0  ; counter

loop:
  ; get input on every other pass to ensure the blinking cursor
  ; puts screen back in correct state (i.e. so cursor doesn't stomp
  ; on your masterpiece)
  ld v0, v6
  ld v1, $1
  and v0, v1
  se v0, 1
  call handleInput

  ; draw cursor
  ld i, cursor
  drw v4, v5, 1

  call replace

  ; delay a bit
  ld v0, 3
  ld dt, v0
  delay:
    ld v0, dt
    se v0, $0
    jp delay

  ; increment counter
  add v6, 1

  jp loop

handleInput:
  ; fire pressed
  ld i, cursor
  ld v0, $6
  sknp v0
  drw v4, v5, 1
  waitForKeyUp:
    sknp v0
    jp waitForKeyUp

  ; right pressed
  ld v0, $9
  sknp v0
  add v4, 1

  ; left pressed
  ld v0, $7
  sknp v0
  add v4, $ff

  ; down pressed
  ld v0, $8
  sknp v0
  add v5, 1

  ; up pressed
  ld v0, $5
  sknp v0
  add v5, $ff

  ; wrap cursor
  ld v0, $3f
  and v4, v0
  ld v0, $1f
  and v5, v0

  ret

; replace the pixel under the cursor
replace:
  ; get pixel at cursor location
  ld i, screen

  ; get byte offset for column
  ld v0, v4
  shr v0
  shr v0
  shr v0

  ret

cursor:
  db $80
  db $00
</code>
</pre>

## TODO
* Fix sound
* Allow remapping of keys

export class Buzzer {
    constructor(context) {
        // create web audio api context
        this.context = context;

        // create Oscillator node
        this.oscillator = this.context.createOscillator();

        this.oscillator.type = 'square';
        this.oscillator.frequency.setValueAtTime(100, this.context.currentTime); // value in hertz
        this.oscillator.connect(this.context.destination);
        this.oscillator.start(0);
    }

    on() {
        console.log('on');
        this.oscillator.connect(this.context.destination);
    }

    off() {
        this.oscillator.disconnect();
    }
}

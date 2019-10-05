export class Buzzer {
    // Call init in response to a click
    init() {
        this.context = new (window.AudioContext || window.webkitAudioContext);

        this.oscillator = this.context.createOscillator();
        this.oscillator.type = 'square';
        this.oscillator.frequency.setValueAtTime(100, this.context.currentTime); // value in hertz
        this.oscillator.connect(this.context.destination);
        this.oscillator.start(0);
    }

    on() {
        if (this.oscillator) {
            this.oscillator.connect(this.context.destination);
        }
    }

    off() {
        if (this.oscillator) {
            this.oscillator.disconnect();
        }
    }
}

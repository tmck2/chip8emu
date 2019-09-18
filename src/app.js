const BackgroundColor = "#10203c"
const ForegroundColor = "#ddd"

const canvas = document.getElementById('display');
const ctx = canvas.getContext('2d');

ctx.fillStyle = BackgroundColor;
ctx.fillRect(0, 0, 64, 32);

ctx.fillStyle = ForegroundColor;
ctx.fillRect(0, 0, 8, 5);

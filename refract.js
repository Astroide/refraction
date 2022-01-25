const ctx = document.querySelector('canvas').getContext('2d');
function drawHalfCircle(centerX, centerY, radius) {
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(128, 128, 128, 0.4)';
    ctx.fillStyle = 'rgba(128, 128, 128, 0.4)';
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, Math.PI, true);
    ctx.lineTo(centerX, centerY);
    ctx.fill();
    ctx.stroke();
}
let ior = location.search ? parseFloat(new URLSearchParams(location.search).get('ior') || '1') : 1;
function drawRay(angle, halfCircleX, halfCircleY, halfCircleRadius) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    angle += Math.PI / 2;
    let startX = Math.cos(angle) * 1000 + halfCircleX;
    let startY = Math.sin(angle) * 1000 + halfCircleY;
    ctx.moveTo(startX, startY);
    ctx.lineTo(halfCircleX, halfCircleY);
    ctx.strokeStyle = 'yellow';
    ctx.stroke();
    angle -= Math.PI / 2;
    let outputAngle = Math.asin(Math.sin(angle) / ior);
    outputAngle -= Math.PI / 2;
    let outputXUnmultiplied = Math.cos(outputAngle);
    let outputYUnmultiplied = Math.sin(outputAngle);
    ctx.beginPath();
    ctx.moveTo(halfCircleX, halfCircleY);
    ctx.lineTo(halfCircleX + outputXUnmultiplied * (halfCircleRadius + 1000), halfCircleY + outputYUnmultiplied * (halfCircleRadius + 1000));
    ctx.stroke();
    drawHalfCircle(halfCircleX, halfCircleY, halfCircleRadius);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText('Indice de réfraction : ' + ior, 250, 100);
}
let a = 0;
let wait = ms => new Promise(r => setTimeout(r, ms));
async function lines() {
    while (true) {
        for (let i = 0; i < 90; i += 0.1) {
            ctx.clearRect(0, 0, 500, 500);
            drawRay(i / 180 * Math.PI, 250, 250, 40);
            await wait(10);
        }
        for (let i = 90; i >= 0; i -= 0.1) {
            ctx.clearRect(0, 0, 500, 500);
            drawRay(i / 180 * Math.PI, 250, 250, 40);
            await wait(10);
        }
    }
}
lines();
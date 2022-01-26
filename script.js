Number.prototype.map = function (in_min, in_max, out_min, out_max) {
    return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}
let dataset = `
0 0
12 10.5
36 23
54.5 31.5
24.5 16
32 22
`;
const Data = dataset.trim().split('\n').map(x => x.trim()).map(x => {
    let parts = x.split(' ').map(x => parseFloat(x));
    return {
        input: parts[0],
        target: parts[1]
    }
}).map(({ input, target }) => {
    return {
        input: Math.sin(input / 180 * Math.PI),
        target: Math.sin(target / 180 * Math.PI)
    }
});

// const Data = [
//     { input: 0 / 5, target: 0 / 5 },
//     { input: 1 / 5, target: 1 / 5 },
//     { input: 2 / 5, target: 2 / 5 },
//     { input: 3 / 5, target: 3 / 5 },
//     { input: 4 / 5, target: 4 / 5 },
//     { input: 5 / 5, target: 5 / 5 }
// ]
/*[
    // { input: 0, target: 0 },
    // { input: 12, target: 10.5 },
    // { input: 36, target: 23 },
    // { input: 54.5, target: 31.5 },
    // { input: 24.5, target: 16 },
    // { input: 32, target: 22 }
    // {
        // input: 21,
        // target: 15.5
    // },
    // {
        // input: 33.5,
        // target: 25
    // },
    // {
        // input: 47,
        // target: 34
    // },
    // {
        // input: 60.5,
        // target: 49.5
    // },
    // {
        // input: 73,
        // target: 43
    // },
]*/


const ctx = document.querySelector('canvas').getContext('2d');

let weight = (Math.random() - 0.5) * 2;
let bias = 0;

function rnd(a) {
    return a[Math.floor(Math.random() * a.length)];
}
let avg = arr => arr.reduce((a, b) => a + b) / arr.length;
let t = 0
let lr = 0.01;
function train() {
    let lr2 = lr
    let lrs = []
    t++
    let gradients = 0;
    let errors = 0;
    for (let i = 0; i < Data.length; i++) {
        let data = Data[i];
        let answer = data.input * weight + bias
        let error = Math.sign(data.target - answer);
        lrs.push(data.target - answer)

        let gradient = error * data.input;
        gradients += (gradient);
        errors += (error);
    }
    // bias += errors / Data.length * lr;
    // console.log(gradient);
    lr2 = avg(lrs);
    weight += gradients * (lr2 / Data.length) / Data.length;
}

function test() {
    let error = 0
    for (let i = 0; i < Data.length; i++) {
        let data = Data[i]
        let answer = data.input * weight + bias
        let error2 = data.target - answer
        error += error2 ** 2
    }
    console.log(error)
    return error;
}

async function train1e4() {
    for (let i = 0; i < 2e3; i++) {
        for (let j = 0; j < 1; j++) {
            train()
        }
        ctx.fillStyle = 'rgba(255, 255, 255, 0.01)';
        ctx.fillRect(0, 0, 500, 500);
        plot();
        ctx.fillStyle = 'red';
        ctx.fillRect(490, 0, 10, 10);
        ctx.fillStyle = 'blue';
        ctx.fillRect(490, 0, i / 2e3 * 10, 10);
        await wait(1);
    }
    console.log('indice de réfraction: ' + 1 / weight);
    location.href = './refract.html?ior=' + (1 / weight);
}
train1e4();

function wait(n) {
    return new Promise(resolve => setTimeout(resolve, n));
}

async function calibrate() {
    let step = 1;
    let sign = 0;
    for (let i = 0; i < Data.length; i++) {
        let data = Data[i];
        let answer = data.input * weight + bias
        let error = data.target - answer

        let gradient = error * data.input * 0.1
        sign += gradient
    }
    sign = Math.sign(sign);
    for (let i = 0; i < 10000; i++) {
        let error = test();
        bias += step * sign;
        if (test() > error) {
            sign = -sign;
            step /= 5;
        }
        plot();
        await wait(1);
    }
}



function plot() {
    let [imin, imax, omin, omax] = Data.reduce(([imin, imax, omin, omax], data) => {
        if (data.input < imin) {
            imin = data.input;
        }
        if (data.input > imax) {
            imax = data.input;
        }
        if (data.target < omin) {
            omin = data.target;
        }
        if (data.target > omax) {
            omax = data.target;
        }
        return [imin, imax, omin, omax];
    }, [Infinity, -Infinity, Infinity, -Infinity]);
    // console.log(imin, imax, omin, omax);
    let newData = Data.map(({ input, target }) => {
        return {
            input: input.map(0, 1, 5, 495),
            target: target.map(0, 1, 5, 495)
        }
    });
    newData = newData.sort((a, b) => a.input - b.input);
    for (let i = 0; i < newData.length; i++) {
        ctx.fillStyle = 'red';
        ctx.fillRect(newData[i].input - 1, newData[i].target - 1, 3, 3);
    }
    for (let i = 5; i < 495; i++) {
        let value = i.map(5, 495, 0, 1) * weight + bias;
        value = value.map(0, 1, 5, 495);
        ctx.fillStyle = 'green';
        // console.log(value);
        ctx.fillRect(i, value, 1, 1);
    }
}

plot();

test()

// console.log(weight)
// calibrate();
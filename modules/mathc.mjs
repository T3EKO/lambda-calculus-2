
function cmod(f, k) {
    return f - k * Math.floor(f / k);
}

function lerp(a, b, k) {
    return (b - a) * k + a;
}

function smoothstep(t) {
    return 3 * t * t - 2 * t * t * t;
}

function randomOf(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export { cmod, lerp, smoothstep, randomOf };
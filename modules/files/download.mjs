
function downloadCanvas(canvas, fileName) {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL();
    link.click();
}

function downloadURL(url, fileName) {
    const link = document.createElement("a");
    link.download = fileName;
    link.href = url;
    link.click();
}

export { downloadCanvas, downloadURL };
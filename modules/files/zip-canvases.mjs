import "../../node_modules/jszip/dist/jszip.js";
import * as Download from "./download.mjs";

async function zipAndDownloadCanvases(canvases, imagePrefix, fileName) {
    const blobs = new Array();
    let blobsGenerated = 0;
    canvases.forEach((e, i) => e.toBlob(blob => {
        blobs[i] = blob;
        blobsGenerated++;

        if(blobsGenerated >= canvases.length) {
            const zip = new JSZip();
            blobs.forEach((e, i) => zip.file(`${imagePrefix}${i}.png`, e));

            zip.generateAsync({ type: "blob" }).then(blob => Download.downloadURL(URL.createObjectURL(blob), `${fileName}.zip`));
        }
    }));
}

export { zipAndDownloadCanvases };
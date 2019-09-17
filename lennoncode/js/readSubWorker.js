// readSubWorker
self.onmessage = function (event) {
    importScripts("../lib/jsQR.js");

    let imageData = event.data.imgData;
    let width = event.data.width;
    let height = event.data.height;

    const code = jsQR(imageData, width, height);
    let sendData = {
        num: event.data.num,
        text: ""
    }
    if (code) {
        let text_decoder = new TextDecoder("shift_jis");
        sendData.text = text_decoder.decode(Uint8Array.from(code.binaryData).buffer);
    }

    self.postMessage(sendData);
    self.close();
};
// readMainWorker
self.onmessage = function (event) {
    let imageData = event.data.imageDataList;

    for (let i = 0; i < imageData[0].length; i += 4) {
        imageData[0][i] = imageData[0][i + 1] = imageData[0][i + 2] = imageData[0][i] >= 255 / 2 ?
            255 :
            0;
        imageData[1][i] = imageData[1][i + 1] = imageData[1][i + 2] = imageData[1][i + 1] >= 255 / 2 ?
            255 :
            0;
        imageData[2][i] = imageData[2][i + 1] = imageData[2][i + 2] = imageData[2][i + 2] >= 255 / 2 ?
            255 :
            0;

        imageData[0][i + 3] = imageData[1][i + 3] = imageData[2][i + 3] = 255;
    }
    // カレントディレクトリが親WebWorker基準になる
    let subWorksers = [
        new Worker("./readSubWorker.js"),
        new Worker("./readSubWorker.js"),
        new Worker("./readSubWorker.js")
    ];
    let sendData = {
        num: 0,
        width: event.data.width,
        height: event.data.height,
        imgData: null
    };
    let revData = {
        success: false,
        text: [null, null, null]
    };
    let count = 0;
    for (let i = 0; i < imageData.length; i++) {
        subWorksers[i].onmessage = (event) => {
            let text = event.data.text;
            if (text.length == 0) {
                self.postMessage(revData);
                self.close();
            } else {
                revData.text[event.data.num] = text;
                if (++count >= 3) {
                    revData.success = true;
                    self.postMessage(revData);
                    self.close();
                }
            }
        };
        sendData.num = i;
        sendData.imgData = imageData[i];
        subWorksers[i].postMessage(sendData, [sendData.imgData.buffer]);
    }
};
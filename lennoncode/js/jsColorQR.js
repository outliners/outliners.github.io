class jsColorQR {
    constructor() {
        this.worker = new Worker("./js/readMainWorker.js");
    }

    readRGBCode(imageData, successFunction) {
        let canvas = document.createElement("canvas");
        canvas.height = imageData.height
        canvas.width = imageData.width
        let context = canvas.getContext("2d");
        context.putImageData(imageData, 0, 0);
        let myimageData = context.getImageData(0, 0, canvas.width, canvas.height)

        let sendData = {
            width: imageData.width,
            height: imageData.height,
            imageDataList: [
                new Uint8ClampedArray(myimageData.data),
                new Uint8ClampedArray(myimageData.data),
                new Uint8ClampedArray(myimageData.data)
            ]
        };
        this.worker.onmessage = function (event) {
            successFunction(event.data);
        };
        this.worker.postMessage(sendData,
            [sendData.imageDataList[0].buffer],
            [sendData.imageDataList[1].buffer],
            [sendData.imageDataList[2].buffer]);
    }

    makeRGBCode(text, size, outputSelector) {
        let textArray = []
        const len = text.length
        // 文字列長で分割
        textArray.push(text.slice(0, len / 3))
        textArray.push(text.slice(len / 3, len / 3 * 2))
        textArray.push(text.slice(len / 3 * 2, len))

        // RGBに変換したQRコードのImageDataを格納
        let imageDataRGB = [new Object(), new Object(), new Object()];

        // 分割したテキストをQRコードに変換する
        for (let i = 0; i < textArray.length; i++) {
            let row = textArray[i];
            // SJISにエンコードする
            let source = Encoding.convert(row, 'SJIS');
            // QRコード作成
            outputSelector.qrcode({
                width: size,
                height: size,
                text: source
            });
            // ColorQRコード作成
            let canvas = outputSelector.children().eq(0).get(0);
            let context = canvas.getContext("2d");
            let imageData = context.getImageData(0, 0, size, size);
            canvas.remove();
            imageDataRGB[i] = this.convertRGB(imageData, i, size);
        }
        this.mergeRGB(imageDataRGB, size, outputSelector);
    }

    convertRGB(imageData, type, size) {
        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        let context = canvas.getContext("2d");
        context.putImageData(imageData, 0, 0);

        // TODO WebWorkerに処理を委譲する
        let sparationImgData = context.getImageData(0, 0, canvas.width, canvas.height)
        let data = sparationImgData.data
        for (let i = 0; i < data.length; i += 4) {
            // 元になるQRコードは[0,0,0]か[255,255,255]なので赤成分だけで判断可能
            data[i + type] = data[i] >= 255 / 2 ?
                255 :
                0;
            data[i + (type + 1) % 3] = data[i + (type + 2) % 3] = 0;

        }
        context.putImageData(sparationImgData, 0, 0);
        return sparationImgData;
    }

    mergeRGB(imageDataArray, size, outputSelector) {
        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        outputSelector.append(canvas);
        let context = canvas.getContext("2d");
        context.putImageData(imageDataArray[0], 0, 0);
        let imageData = context.getImageData(0, 0, size, size);
        let data = imageData.data;
        let pallete = [
          [105,251.46],
          [246,255,12],
          [107,246,253],
          [250,54,250],
          [255,176,255],
          [255,148,20]];

        for (let i = 0; i < data.length; i += 4) {
            let lennon = Math.floor (Math.random()*6);
            //console.log (pallete[lennon]);
            //data[i]     += pallete[lennon][0]; //+= imageDataArray[1].data[i] + imageDataArray[2].data[i]
            //data[i + 1] += pallete[lennon][1]; //+= imageDataArray[1].data[i + 1] + imageDataArray[2].data[i + 1]
            //data[i + 2] += pallete[lennon][2]; //+= imageDataArray[1].data[i + 2] + imageDataArray[2].data[i + 2]
            data[i]     += imageDataArray[1].data[i] + imageDataArray[2].data[i]
            data[i + 1] += imageDataArray[1].data[i + 1] + imageDataArray[2].data[i + 1]
            data[i + 2] += imageDataArray[1].data[i + 2] + imageDataArray[2].data[i + 2]
            if (data[i] == 0 & data[i+1] ==0 & data[i+2]==0 ) {data[i]= 250;data[i+1]= 54; data[i+2] = 250  };
            if (data[i] == 0 & data[i+1] ==255 & data[i+2]==255 ) {  data[i]= 105;data[i+1]= 251; data[i+2] = 46  };
            if (data[i] == 0 & data[i+1] ==0 & data[i+2]==255 ) {  data[i]= 107;data[i+1]= 246; data[i+2] = 253  };
            if (data[i] == 255 & data[i+1] ==255 & data[i+2]==255 ) { };
            if (data[i] == 255 & data[i+1] ==0 & data[i+2]==255 ) {   data[i]= 246;data[i+1]= 255; data[i+2] = 12   };
            if (data[i] == 255 & data[i+1] ==0 & data[i+2]==0 ) {data[i]= 255;data[i+1]= 148; data[i+2] = 20   };
            if (data[i] == 255 & data[i+1] ==255 & data[i+2]==0 ) { data[i]= 255;data[i+1]= 176; data[i+2] = 255};


        }
        context.putImageData(imageData, 0, 0);
        return imageData;
    }

}

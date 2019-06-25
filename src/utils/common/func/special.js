//数字金额转换中文大写
export const changeMoney = (n) => {
  if (!/^(0|[1-9]\d*)(\.\d+)?$/.test(n)) return "数据非法";
  var unit = "京亿万仟佰拾兆万仟佰拾亿仟佰拾万仟佰拾元角分";
  var str = "";
  n += "00";
  var p = n.indexOf('.');
  if (p >= 0) {
    n = n.substring(0, p) + n.substr(p + 1, 2);
  }
  unit = unit.substr(unit.length - n.length);
  for (var i = 0; i < n.length; i++) str += '零壹贰叁肆伍陆柒捌玖'.charAt(n.charAt(i)) + unit.charAt(i);
  return str.replace(/零(仟|佰|拾|角)/g, "零").replace(/(零)+/g, "零").replace(/零(兆|万|亿|元)/g, "$1").replace(/(兆|亿)万/g, "$1").replace(/(京|兆)亿/g, "$1").replace(/(京)兆/g, "$1").replace(/(京|兆|亿|仟|佰|拾)(万?)(.)仟/g, "$1$2零$3仟").replace(/^元零?|零分/g, "").replace(/(元|角)$/g, "$1整");
};

/**
 * 下载文件方法
 */
export function fileDownload(content) {
  // 创建隐藏的可下载链接
  var eleLink = document.createElement('a');
  // eleLink.download = filename;
  eleLink.style.display = 'none';
  // 字符内容转变成blob地址
  // var blob = new Blob([content]);
  // eleLink.href = URL.createObjectURL(blob);
  eleLink.href = content;
  // 触发点击
  document.body.appendChild(eleLink);
  eleLink.click();
  // 然后移除
  document.body.removeChild(eleLink);
}

//将base64转换为文件
export function base64ToFile(base64, filename) {
  let arr = base64.split(',');
  let mime = arr[0].match(/:(.*?);/)[1];
  let bstr = atob(arr[1]);
  let n = bstr.length;
  let u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, {type: mime});
}
//将文件转换为base64（异步）
export function fileToBase64(file) {
  return new Promise(((resolve, reject) => {
    var fileReader = new FileReader();
    fileReader.readAsDataURL(file);
    fileReader.onload = function() {
      //读取完成后，数据保存在对象的result属性中
      resolve(this.result);
    };
    fileReader.onerror = function() {
      reject(this.error);
    };
  }));
}
//图片压缩（异步）
export function imgCompress(data, type = 'file', opt = {}) {
  if (!data && !['file', 'base64'].includes(type)) return;
  let fileName = 'compressed.jpg';
  if (type === 'file' && data.name) {
    let fileNameList = data.name.split('.');
    fileNameList[fileNameList.length - 1] = 'jpg';
    fileName = fileNameList.join('.');
  }
  const defaultOption = {
    rate: 0.92, //压缩率
    maxWidth: 1024, //最大宽度
    maxHeight: 1024, //最大高度
    fileName
  };
  let option = Object.assign({}, defaultOption, opt);
  /**
   * 获得图片对象
   **/
  function getImg(data, type) {
    return new Promise((resolve) => {
      let img = new Image();
      if (type === 'file') {
        fileToBase64(data).then(base64=>{
          img.src = base64;
          resolve(img);
        });
      } else if (type === 'base64') {
        img.src = data;
        resolve(img);
      }
    });
  }
  /**
   * 压缩方法
   **/
  function compress(img, opt) {
    let { rate, maxWidth, maxHeight } = opt;
    // let oldFileSize = img.src.length;
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    // 图片原始尺寸
    var originWidth = img.width;
    var originHeight = img.height;
    // 目标尺寸
    var targetWidth = originWidth;
    var targetHeight = originHeight;
    // 图片尺寸超过长宽的限制
    if (originWidth > maxWidth || originHeight > maxHeight) {
      if (originWidth / originHeight > maxWidth / maxHeight) {
        // 更宽，按照宽度限定尺寸
        targetWidth = maxWidth;
        targetHeight = Math.round(maxWidth * (originHeight / originWidth));
      } else {
        targetHeight = maxHeight;
        targetWidth = Math.round(maxHeight * (originWidth / originHeight));
      }
    }
    // canvas对图片进行缩放
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    // 清除画布
    context.clearRect(0, 0, targetWidth, targetHeight);
    // 图片压缩
    context.drawImage(img, 0, 0, targetWidth, targetHeight);
    /*第一个参数是创建的img对象；第二三个参数是左上角坐标，后面两个是画布区域宽高*/

    //压缩后的图片转base64 url
    /**canvas.toDataURL(mimeType, qualityArgument),mimeType 默认值是'image/png';
     * qualityArgument表示导出的图片质量，只有导出为jpeg和webp格式的时候此参数才有效，默认值是0.92
     **/
    var newUrl = canvas.toDataURL('image/jpeg', rate);//base64 格式
    return newUrl;
    // if (newUrl.length > oldFileSize) {
    //   return base64ToFile(img.src, fileName);
    // } else {
    //   return base64ToFile(newUrl, fileName);
    // }
    //也可以把压缩后的图片转blob格式用于上传
    // canvas.toBlob((blob)=>{
    //     console.log(blob)
    //     //把blob作为参数传给后端
    // }, 'image/jpeg', 0.92)
  }

  return getImg(data, type).then(img=>{
    let { fileName } = option;
    let newUrl = compress(img, option);
    if (newUrl.length > img.src.length) {
      console.warn('该图片在当前压缩配置下无法压缩');
      if (type === 'file') {
        return data;
      } else {
        return base64ToFile(img.src, fileName);
      }
    } else {
      return base64ToFile(newUrl, fileName);
    }
  });
}

//限流
export function throttle(delay, noTrailing, callback, debounceMode) {

  // After wrapper has stopped being called, this timeout ensures that
  // `callback` is executed at the proper times in `throttle` and `end`
  // debounce modes.
  var timeoutID;

  // Keep track of the last time `callback` was executed.
  var lastExec = 0;

  // `noTrailing` defaults to falsy.
  if (typeof noTrailing !== 'boolean') {
    debounceMode = callback;
    callback = noTrailing;
    noTrailing = undefined;
  }

  // The `wrapper` function encapsulates all of the throttling / debouncing
  // functionality and when executed will limit the rate at which `callback`
  // is executed.
  function wrapper () {

    var self = this;
    var elapsed = Number(new Date()) - lastExec;
    var args = arguments;

    // Execute `callback` and update the `lastExec` timestamp.
    function exec () {
      lastExec = Number(new Date());
      callback.apply(self, args);
    }

    // If `debounceMode` is true (at begin) this is used to clear the flag
    // to allow future `callback` executions.
    function clear () {
      timeoutID = undefined;
    }

    if (debounceMode && !timeoutID) {
      // Since `wrapper` is being called for the first time and
      // `debounceMode` is true (at begin), execute `callback`.
      exec();
    }

    // Clear any existing timeout.
    if (timeoutID) {
      clearTimeout(timeoutID);
    }

    if (debounceMode === undefined && elapsed > delay) {
      // In throttle mode, if `delay` time has been exceeded, execute
      // `callback`.
      exec();

    } else if (noTrailing !== true) {
      // In trailing throttle mode, since `delay` time has not been
      // exceeded, schedule `callback` to execute `delay` ms after most
      // recent execution.
      //
      // If `debounceMode` is true (at begin), schedule `clear` to execute
      // after `delay` ms.
      //
      // If `debounceMode` is false (at end), schedule `callback` to
      // execute after `delay` ms.
      timeoutID = setTimeout(debounceMode ? clear : exec, debounceMode === undefined ? delay - elapsed : delay);
    }

  }

  // Return the wrapper function.
  return wrapper;

};


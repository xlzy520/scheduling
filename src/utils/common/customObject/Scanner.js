export default function Scanner() {
  let downTime = null;
  let upTime = null;
  let keycode = null;
  let text = '';
  let listenerObj = window.document;
  let callback;
  let keydownFn = function (e) {
    keycode = e.keyCode || e.which || e.charCode;
    downTime = new Date().getTime();
    // e.preventDefault();
    // e.stopPropagation();
  };
  let keyupFn = function (e) {
    let _keycode = e.keyCode || e.which || e.charCode;
    upTime = new Date().getTime();
    if (upTime - downTime < 30 && _keycode === keycode) {
      if (_keycode === 13) {
        callback(text);
        text = '';
      } else {
        text += String.fromCharCode(_keycode);
      }
      e.preventDefault();
      e.stopPropagation();
    }
    // e.preventDefault();
  };
  let listener = function (fn) {
    callback = fn;
    listenerObj.addEventListener('keydown', keydownFn);
    listenerObj.addEventListener('keyup', keyupFn);
  };
  let end = function () {
    listenerObj.removeEventListener('keydown', keydownFn);
    listenerObj.removeEventListener('keyup', keyupFn);
  };
  return {
    listener,
    end
  };
}

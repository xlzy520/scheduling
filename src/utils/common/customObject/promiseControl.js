function ControlMap() {
  let map = {};
  let index = 0;
  this.addItem = function (url) {
    // vueComponent.$options.name +
    let key = url + index;
    map[key] = true;
    index++;
    console.log('addItem *** key  = ', key);
    return key;
  };
  this.deleteItem = function (key) {
    if (map[key]) {
      delete map[key];
      console.log('deleteItem *** key  = ', key);
    }
  };
  this.deleteItems = function (keyArr = []) {
    for (let key of keyArr) {
      this.deleteItem(key);
    }
  };
  this.clear = function () {
    map = {};
  };
  this.indexOf = function (key) {
    return map[key] === true;
  };
}

let map = new ControlMap();
export default map;

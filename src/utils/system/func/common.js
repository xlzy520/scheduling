export const cloneData = function (arr = [], obj1 = {}, obj2 = {}) {
  arr.forEach(key=>{
    obj1[key] = obj2[key];
  });
  return obj1;
};

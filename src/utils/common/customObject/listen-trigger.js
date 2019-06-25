// import {hasValue_arr} from '@/utils/func';
import { hasValue_arr } from '@/utils/common/func/array';
const SubjectFactory = function () {
  this.list = {};
  this.listen = function (key, fn) {
    if (!this.list[key]) {
      this.list[key] = [];
    }
    this.list[key].push(fn);
  };
  this.trigger = function () {
    let key = Array.prototype.shift.call(arguments);
    let fns = this.list[key];
    if (!fns || fns.length === 0) {
      return false;
    }
    for (let i = 0, len = fns.length; i < len; i++) {
      fns[i].apply(this, arguments);
    }
  };
  this.remove = function (key, fn) {
    let fns = this.list[key];
    if (!fns) {
      return false;
    }
    if (!fn) {
      fns && (fns.length = 0);
    } else {
      for (let i = fns.length - 1; i >= 0; i--) {
        let _fn = fns[i];
        if (_fn === fn) {
          fns.splice(i, 1);
        }
      }
    }
  };
  this.hasListen = (key) => {
    console.log('list[key]', this.list[key]);
    return hasValue_arr(this.list[key]);
  };
  this.getSubjectList = () => {
    return this.list;
  };
};

const djSubject = new SubjectFactory();

export {SubjectFactory, djSubject};

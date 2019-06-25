import { coerceBoolean } from './boolean';

export const timeFormat = (time, format) => {
  let _time = time;
  if (!coerceBoolean(_time)) return '';
  if (/^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}(\.0)?$/g.test(_time)) { //‘2018-08-21 15:28:00’这种格式ie浏览器不兼容
    _time = _time.replace(/-/g, '/');
    _time = _time.replace(/(\.0)?$/i, '');
  }
  let t = new Date(_time);
  let y = t.getFullYear();
  let M = t.getMonth() + 1;
  if (M < 10) M = '0' + M;
  let d = t.getDate();
  if (d < 10) d = '0' + d;
  let H = t.getHours();
  if (H < 10) H = '0' + H;
  let m = t.getMinutes();
  if (m < 10) m = '0' + m;
  let s = t.getSeconds();
  if (s < 10) s = '0' + s;
  return format.replace(/yyyy/, y).replace(/MM/, M).replace(/dd/, d).replace(/HH/, H).replace(/mm/, m).replace(/ss/, s);
};

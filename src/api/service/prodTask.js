import {prodTask} from '../base-service/service';

export default {
  lineList(data) {
    return prodTask('/line-list.do', data);
  },
  list(data) {
    return prodTask('/list.do', data);
  },
  removeOrder(data) {
    return prodTask('/removeOrder.do', data);
  },
  processe(data) {
    return prodTask('/processe.do', data);
  },
};

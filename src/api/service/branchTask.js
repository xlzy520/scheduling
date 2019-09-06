import {branchTask} from '../base-service/service';

export default {
  list(data) {
    return branchTask('/list.do', data);
  },
  removeOrder(data) {
    return branchTask('/removeOrder.do', data);
  },
  processe(data) {
    return branchTask('/processe.do', data);
  },
  getDivideMsg(data) {
    return branchTask('/getDivideMsg.do', data);
  },
};

import {branchTask} from '../base-service/service';

export default {
  list(data) {
    return branchTask('/list.do', data);
  },
  removeOrder(data) {
    return branchTask('/removeOrder.do', data);
  },
  handle(data) {
    return branchTask('/handle.do', data);
  },
};

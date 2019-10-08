import {prodTask} from '../base-service/service';

export default {
  list(data) {
    return prodTask('/pageSearch.do', data, 'get');
  },
  removeOrder(data) {
    return prodTask('/removeOrder.do', data);
  },
  findDetailByProduceOrderNumber(data) {
    return prodTask('/findDetailByProduceOrderNumber.do', data, 'get');
  },
  toProduceManager(data) {
    return prodTask('/toProduceManager.do', data);
  },
  exportExcel(data) {
    return prodTask('/exportExcel.do', data, 'download_post');
  },
};

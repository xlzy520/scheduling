import {prodTask} from '../base-service/service';

export default {
  list(data) {
    return prodTask('/pageSearch.do', data, 'get');
  },
  removeOrder(data) {
    return prodTask('/removeOrder.do', data);
  },
  findByProduceOrderNumber(data) {
    return prodTask('/findByProduceOrderNumber.do', data, 'get');
  },
  toProduceManager(data) {
    return prodTask('/toProduceManager.do', data);
  },
};

import {orderStatistics} from '../base-service/service';

export default {
  list(data) {
    return orderStatistics('/list.do', data);
  }
};

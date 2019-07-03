import {productionLine} from '../base-service/service';

export default {
  list(data) {
    return productionLine('/list', data);
  }
};

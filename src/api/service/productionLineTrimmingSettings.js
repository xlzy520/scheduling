import {productionLineTrimmingSettings} from '../base-service/service';

export default {
  list(data) {
    return productionLineTrimmingSettings('/list', data);
  },
};

import {productionMinority} from '../base-service/service';

export default {
  list(params) {
    return productionMinority('/getProduceFewList.do', params);
  },
  exportFile(params) {
    return productionMinority('/exportProduceFewList.do', params, 'download_get');
  }
};

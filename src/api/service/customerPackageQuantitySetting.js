import {customerPackageQuantitySetting} from '../base-service/service';

export default {
  list(data) {
    return customerPackageQuantitySetting('/list', data);
  }
};

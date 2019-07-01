import {paperSupplier} from '../base-service/service';

export default {
  list(data) {
    return paperSupplier('/list', data);
  },
};

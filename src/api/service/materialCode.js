import {materialCode} from '../base-service/service';

export default {
  list(data) {
    return materialCode('/list', data);
  }
};

import {paperInStock} from '../base-service/service';

export default {
  list(data) {
    return paperInStock('/list.do', data);
  }
};

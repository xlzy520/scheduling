import {record} from '../base-service/service';

export default {
  list(data) {
    return record('/list.do', data);
  },
};

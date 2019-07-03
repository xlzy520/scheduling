import {ruleCustomize} from '../base-service/service';

export default {
  list(data) {
    return ruleCustomize('/list', data);
  }
};

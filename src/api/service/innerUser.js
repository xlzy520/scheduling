import {innerUser} from '../base-service/service';

export default {
  getToken(params) {
    return innerUser('/handleOnceToken.do', params);
  }
};

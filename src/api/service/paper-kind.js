import {paperKind} from '../base-service/service';

export default {
  list(data) {
    return paperKind('/list', data);
  },
  logout() {
    return paperKind('/logout.do');
  }
};

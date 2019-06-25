import {user} from '../base-service/service';

export default {
  login(params) {
    return user('/login/', params);
  },
  logout() {
    return user('/logout.do');
  }
};

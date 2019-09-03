import {report} from '../base-service/service';

export default {
  exportFile(url, data) {
    return report(`/${url}.do`, data, 'download_post');
  }
};

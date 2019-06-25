import { HttpFactory } from 'djweb';
import httpConfig from '../http/httpConfig';
const apiService = new HttpFactory(httpConfig);

function baseApi(service, value = {}, method = 'post') {
  let { cancelToken } = value;
  delete value.cancelToken;
  return apiService[method](service, value, undefined, undefined, cancelToken);
}

export default function baseService(base) {
  return (url, param, method) => {
    let service = base + url;
    return baseApi(service, param, method);
  };
}

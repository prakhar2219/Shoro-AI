import axios from 'axios';

class ApiService {
  constructor(baseEndpoint = '') {
    const isServer = typeof window === 'undefined';

    const baseURL = isServer
      ? process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
      : process.env.NEXT_PUBLIC_API_URL;

    this.client = axios.create({
      baseURL,
      withCredentials: true,
    });

    this.baseEndpoint = baseEndpoint;
  }

  setEndpoint(endpoint) {
    this.baseEndpoint = endpoint;
  }

  getUrl(path = '') {
    return `${this.baseEndpoint}${path}`;
  }

  get(path = '', config = {}) {
    return this.client.get(this.getUrl(path), config);
  }

  post(path = '', data = {}, config = {}) {
    return this.client.post(this.getUrl(path), data, config);
  }

  put(path = '', data = {}, config = {}) {
    return this.client.put(this.getUrl(path), data, config);
  }

  delete(path = '', config = {}) {
    return this.client.delete(this.getUrl(path), config);
  }
}

export default ApiService;

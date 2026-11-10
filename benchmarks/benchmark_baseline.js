import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // Baseline load test before Caching & Indexing
  vus: 30,
  duration: '30s',
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  cloud: {
    projectID: 8500211,
    name: 'Baseline - Products API Uncached (Before Optimization)',
  },
};

export default function () {
  const res = http.get('http://host.docker.internal:8001/api/products?limit=50');

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has data array': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body && body.data && body.data.length > 0;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(0.1);
}

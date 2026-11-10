import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 30,
  duration: '30s',
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  cloud: {
    projectID: 8500211,
    name: 'Comparison A - Dynamic ETag Only (Without Redis)',
  },
};

export default function () {
  // Simulate realistic client lifecycle: 1 in 5 requests is a cold start / new product fetch
  const isColdRequest = (__ITER % 5 === 0);

  const params = {
    headers: {
      'x-bypass-redis': 'true',
    },
  };

  if (!isColdRequest) {
    // Send previously cached ETag
    params.headers['If-None-Match'] = '"9fe860b26c28615abe551a2c733890b1"';
  }

  const res = http.get('http://host.docker.internal:8000/api/v1/products/1', params);

  check(res, {
    'status is valid (200 or 304)': (r) => r.status === 200 || r.status === 304,
  });

  sleep(0.01);
}

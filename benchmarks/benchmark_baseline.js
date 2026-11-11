import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 1. Baseline load test for ALL Products without Caching (Pure Raw Database)
  vus: 30,
  duration: '30s',
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  cloud: {
    projectID: 8500211,
    name: '1. Baseline - All Products Raw DB (Uncached)',
  },
};

export default function () {
  const params = {
    headers: {
      'x-bypass-redis': 'true', // 100% of requests bypass Redis to hit Laravel Repository & MySQL
    },
  };

  // No If-None-Match sent: Bypasses ETag 304 to test raw data retrieval from DB
  const res = http.get('http://host.docker.internal:8000/api/v1/products', params);

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

  sleep(0.01);
}

import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 3. Load test for ALL Products with ETag & In-Memory Redis Combined
  vus: 30,
  duration: '30s',
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  cloud: {
    projectID: 8500211,
    name: '3. Comparison B - All Products ETag & In-Memory Redis Combined',
  },
};

let cachedEtag = '"77dd00d5977c041d71921f5a927d44ef"';

export default function () {
  // Staggered cold request distribution (1 in 5 requests)
  const isColdRequest = ((__ITER + __VU) % 5 === 0);

  const params = {
    headers: {}, // Redis is enabled: Cold requests hit Redis in RAM!
  };

  if (!isColdRequest && cachedEtag) {
    params.headers['If-None-Match'] = cachedEtag;
  }

  const res = http.get('http://host.docker.internal:8000/api/v1/products', params);

  if (res.status === 200) {
    const etag = res.headers['ETag'] || res.headers['Etag'];
    if (etag) {
      cachedEtag = etag;
    }
  }

  check(res, {
    'status is valid (200 or 304)': (r) => r.status === 200 || r.status === 304,
  });

  sleep(0.01);
}

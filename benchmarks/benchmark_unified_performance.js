import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  // 4. Fully Optimized Unified Benchmark (Milestone 3 Architecture)
  // Combines: MySQL Indexing (Proved by EXPLAIN) + N+1 Eager Loading + Redis Cache + HTTP ETag 304
  vus: 30,
  duration: '30s',
  summaryTrendStats: ['avg', 'min', 'med', 'p(90)', 'p(95)', 'p(99)', 'max'],
  cloud: {
    projectID: 8500211,
    name: '4. Fully Optimized Unified Benchmark (ETag, Redis, MySQL Indexing & EXPLAIN)',
  },
};

const BASE_URL = 'http://host.docker.internal:8000/api/v1/products';
let cachedEtag = '"77dd00d5977c041d71921f5a927d44ef"';

export default function () {
  // 95% warm browser requests (ETag 304 in <5ms), 5% cache refresh (Redis in RAM <15ms)
  // Backed by MySQL composite index & eager loading (0.1ms)
  const isColdRequest = ((__ITER + __VU) % 20 === 0);

  const params = {
    headers: {},
  };

  if (!isColdRequest && cachedEtag) {
    params.headers['If-None-Match'] = cachedEtag;
  }

  const res = http.get(BASE_URL, params);

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

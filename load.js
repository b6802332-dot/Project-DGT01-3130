import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 50 },
    { duration: '2m', target: 300 },
    { duration: '30s', target: 0 },
  ],
};

export default function () {
  http.get(`${__ENV.BASE}/api/grades?student_id=6401001`);
  http.get(`${__ENV.BASE}/api/courses`);
  sleep(0.1);
}

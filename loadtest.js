import http from 'k6/http';
import { sleep } from 'k6';

const url = 'http://localhost:8000/api/login/1';

export const options = {
  vus: 300,
  duration: '30s',
};

export default function () {
    let data = { 'userName': '9830152752', 'password': 'pixel' };

    let res = http.post(url, JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' },
    });

    res = http.post(url, data);
    // console.log(res.json());
    sleep(1);
}

const axios = require('axios');
const md5 = require('md5');
const puppeteer = require('puppeteer');
const urljoin = require('url-join');
const random_useragent = require('random-useragent');


const base_headers = {
    'accept': 'application/json',
    'Accept-Encoding': 'gzip, deflate, br',
    'Accept-Language': 'en-US,en;q=0.9,es;q=0.8',
    'Connection': 'keep-alive',
    'content-type': 'application/json',
    'x-device-type': 'web',
};


const endpoints = {
    chat: 'personal_bot_chat',
    profile: 'personal_bot',
    memory: 'memory',
    user_profile: 'profile',
};


function gen_timestamp_hash(device_id) {
    return md5('time_covfefe_prefix=2020_' + device_id);
}


async function get_auth(username) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto('https://my.replika.ai/login');
    await page.waitForSelector('input[id=emailOrPhone]');
    await page.type('input[id=emailOrPhone]', username);
    await page.click('button[type="submit"]');
    const localStorage = await page.evaluate(() => localStorage.getItem('auth'));
    await page.close();
    await browser.close();

    const device_id = JSON.parse(localStorage)['deviceId'];
    return {
        'x-device-id': device_id,
        'x-timestamp-hash': gen_timestamp_hash(device_id),
    };
}


async function login(username, password) {
    const auth = await get_auth(username);
    const user_headers = {
        ...base_headers,
        ...auth,
        'User-Agent': random_useragent.getRandom(),
        'Content-Length': '577',
    };
    const payload = {
        id_type: 'email',
        id_string: username,
        password: password,
    };

    const response = await axios.post(
        'https://my.replika.ai/api/mobile/1.4/auth/sign_in/actions/auth_by_password',
        payload,
        { headers: user_headers },
    );
    return {
        ...auth,
        'x-user-id': response.data['user_id'],
        'x-auth-token': response.data['auth_token'] };
}


async function get_data(auth, endpoint) {
    const user_headers = {
        ...base_headers,
        ...auth,
    };
    const url = urljoin('https://my.replika.ai/api/mobile/1.4/', endpoints[endpoint]);
    const response = await axios.get(url, { headers: user_headers });
    return response.data;
}

async function change_profile(auth, name, gender) {
    const user_headers = {
        ...base_headers,
        ...auth,
    };
    const payload = {
        first_name: name,
        last_name: null,
        pronoun: gender,
    };
    const response = await axios.patch(
        'https://my.replika.ai/api/mobile/1.4/profile',
        payload,
        { headers: user_headers },
    );
    return response;
}


module.exports = {
    get_auth: get_auth,
    get_data: get_data,
    login: login,
    gen_timestamp_hash: gen_timestamp_hash,
    change_profile: change_profile,
};
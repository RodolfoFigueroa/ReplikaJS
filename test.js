const axios = require('axios');

async function makeHeadRequest(url) {
    try {
        const res = await axios.head(url);
        return res.headers['content-type'].startsWith('image') && res.headers['content-length'] <= 1024 * 1024;
    }
    catch (error) {
        return;
    }
}

makeHeadRequest('https://derpicdn.net/img/2021/10/6/2717544/large.jpg').then(x => console.log(x));
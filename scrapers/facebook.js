const axios = require('axios');
const cheerio = require('cheerio');

const fb = {
    dl: async (url) => {
        const fetchUrl = `https://fsaver.net/download/?url=${url}`;
        const headers = {
            "Upgrade-Insecure-Requests": "1",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
            "sec-ch-ua": '"Chromium";v="130", "Google Chrome";v="130", "Not?A_Brand";v="99"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"'
        };
        try {
            const response = await axios.get(fetchUrl, { headers });
            const html = response.data;
            const data = await fb.getData(html);
            return data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },
    getData: async (content) => {
        try {
            const baseUrl = 'https://fsaver.net';
            const $ = cheerio.load(content);
            const videoSrc = $('.video__item').attr('src');

            if (!videoSrc) throw new Error('Video tidak ditemukan.');
let ress = { 
status: true,
creator: "I'm Fz",
video: baseUrl + videoSrc 
};
            return ress; 
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
};

module.exports = fb
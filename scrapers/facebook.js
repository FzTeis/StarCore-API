const axios = require('axios');
const cheerio = require('cheerio');

async function fetchHtml(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        throw new Error(`Error al obtener el HTML: ${error.message}`);
    }
}

function extractDownloadLinks(html) {
    const $ = cheerio.load(html);
    const downloadLinks = [];

    $('a').each((index, element) => {
        const href = $(element).attr('href');
        if (href && href.includes('download')) {
            downloadLinks.push(href);
        }
    });

    return downloadLinks;
}

async function fbdl(url) {
    try {
        const html = await fetchHtml(url);
        const downloadLinks = extractDownloadLinks(html);

        if (downloadLinks.length === 0) {
            throw new Error('No se encontraron enlaces de descarga.');
        }

        return { status: true,
creator: "I'm Fz", data: downloadLinks }
    } catch (error) {
        throw new Error(`Error en fbdl: ${error.message}`);
    }
}

module.exports = { fbdl };
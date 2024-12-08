// scrapers/facebook.js
const scrapers = require('@bochilteam/scraper');  // Usamos el scraper global

// Función que descarga el video de Facebook
async function downloadFacebookVideo(url) {
    try {
        const res = await scrapers.facebookdlv2(url);

        if (res && Array.isArray(res.result)) {
            // Intentar encontrar el video en 720p o 360p
            const video = res.result.find(video => video.quality === '720p') ||
                          res.result.find(video => video.quality === '360p');

            if (video) {
                return { status: true, url: video.url };
            } else {
                return { status: false, message: 'No se encontró ningún video con las calidades 720p ni 360p' };
            }
        } else {
            return { status: false, message: 'Ocurrió un error al obtener el video' };
        }
    } catch (err) {
        console.error(err);
        return { status: false, message: 'Error al obtener el video desde Facebook' };
    }
}

module.exports = { downloadFacebookVideo };
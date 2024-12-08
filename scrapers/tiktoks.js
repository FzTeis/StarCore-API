const axios = require('axios'); // Importa axios
async function acc(url) {
  const respuesta = await axios.get(`http://tinyurl.com/api-create.php?url=${url}`);
  return respuesta.data;
}
async function ttks(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios({
        method: 'POST',
        url: 'https://tikwm.com/api/feed/search',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'Cookie': 'current_language=en',
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
        },
        data: {
          keywords: query,
          count: 10,
          cursor: 0,
          HD: 1
        }
      });
      const videos = response.data.data.videos;
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.");
      } else {
        const gywee = Math.floor(Math.random() * videos.length);
        const videorndm = videos[gywee]; 

        const result = {
          status: true,
          creator: "I'm Fz~",
          data: {
          title: videorndm.title,
          cover: await acc(videorndm.cover),
          origin_cover: await acc(videorndm.origin_cover),
          no_watermark: await acc(videorndm.play),
          watermark: await acc(videorndm.wmplay),
          music: await acc(videorndm.music)
          }
        };
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}
module.exports = { ttks }
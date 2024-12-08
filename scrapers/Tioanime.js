const axios = require('axios')
const cheerio = require('cheerio')

const searchAnime = async (query) => {
  const url = `https://tioanime.com/directorio?q=${encodeURIComponent(query)}`;
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const results = [{
        status: true,
        creator: "I'm Fz"
    }];
    $('ul.animes li').each((_, element) => {
      const name = $(element).find('h3.title').text().trim();
      const id = $(element).find('a').attr('href').split('/').pop();
      const image = $(element).find('img').attr('src');
      const animeUrl = `https://tioanime.com${$(element).find('a').attr('href')}`; 

      results.push({
        name,
        id,
        image: `https://tioanime.com${image}`,
        url: animeUrl, 
      });
    });

    return results;
  } catch (error) {
    console.error('Error al buscar el anime:', error.message);
    return { error: 'No se pudieron obtener los resultados' };
  }
};

async function acc(longUrl) {
  try {
    const response = await axios.get(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
    return response.data;
  } catch (error) {
    console.error('Error al acortar el enlace:', error.message);
    return longUrl;
  }
}
const getDownloadLinks = async (url) => {
  try {
    
    const response = await axios.get(url);
    const html = response.data;

  
    const $ = cheerio.load(html);

   
    const downloads = {};
    $('table.table-downloads tbody tr').each((_, element) => {
      const server = $(element).find('td:nth-child(2)').text().trim();
      const link = $(element).find('td:nth-child(4) a').attr('href');

      if (server && link) {
        downloads[server] = link;
      }
    });

    return downloads;
  } catch (error) {
    console.error('Error al procesar la URL:', url, error.message);
    return { error: 'No se pudieron obtener los enlaces' };
  }
};

async function getAnimeEpisodes(url) {
  try {
    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);
    
    const script = $('script').filter((i, el) => {
      const text = $(el).text();
      return text.includes('var anime_info') && text.includes('var episodes');
    });

    if (script.length === 0) {
      throw new Error('No se encontró el script que contiene las variables.');
    }

    const scriptText = script.html();
    const animeInfoMatch = scriptText.match(/var anime_info = (\[.*?\]);/);
    const episodesMatch = scriptText.match(/var episodes = (\[.*?\]);/);

    if (!animeInfoMatch || !episodesMatch) {
      throw new Error('No se encontraron las variables anime_info o episodes en el script.');
    }

    const animeInfo = JSON.parse(animeInfoMatch[1]);
    const episodes = JSON.parse(episodesMatch[1]);

    const animeId = animeInfo[1];

    const episodeUrls = episodes.reverse().map((episode, index) => ({
      [`Episodio ${index + 1}`]: `https://tioanime.com/ver/${animeId}-${episode}`
    }));

    const nextEpisodeElement = $('span.next-episode span');
    const nextEpisode = nextEpisodeElement.text() || 'N/A';

    return {
      proximo_episodio: nextEpisode,
      episodios: episodeUrls
    };
  } catch (error) {
    console.error('Error al obtener los episodios:', error.message);
    return { error: `Error al procesar la solicitud: ${error.message}` };
  }
}

async function processAnime(url) {
  try {
    const animeData = await getAnimeEpisodes(url);

    if (animeData.error) {
      return animeData;
    }

    const episodios = animeData.episodios;
    const resultados = [];

    for (const episodio of episodios) {
      const [episodioNombre, episodioUrl] = Object.entries(episodio)[0];
      console.log(`Procesando ${episodioNombre}: ${episodioUrl}`);

      const downloadLinks = await getDownloadLinks(episodioUrl);
      const servidores = Object.keys(downloadLinks); // Servidores encontrados
      const links = {};

      for (const server of servidores) {
        const link = downloadLinks[server];
        const shortLink = await acc(link);
        links[server.toLowerCase()] = shortLink; // Asignamos el link con el nombre del servidor en minúsculas
      }

      resultados.push({
        episodio: episodioNombre,
        servidores: servidores,
        links: links
      });
    }

    return {
      proximo_episodio: animeData.proximo_episodio,
      episodios: resultados
    };
  } catch (error) {
    console.error('Error al procesar el anime:', error.message);
    return { error: 'No se pudo completar el procesamiento.' };
  }
}

module.exports = { processAnime, searchAnime }
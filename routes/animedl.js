const fs = require("fs");
const path = require("path");
const { processAnime } = require("../scrapers/Tioanime.js");

let key = JSON.parse(fs.readFileSync("./database/apikeys.json"));
const usus_r = JSON.parse(fs.readFileSync("./database/usuarios.json"));

async function RG_US(apikey, req) {
  const i4 = key.map(i => i?.apikey)?.indexOf(apikey);
  if (i4 >= 0) {
    key[i4].request -= 1;
    fs.writeFileSync("./database/apikeys.json", JSON.stringify(key, null, 2));
    const IP = req.headers["x-real-ip"] || req.connection.remoteAddress || 0;
    const i3 = usus_r.map(i => i.key).indexOf(apikey);
    if (i3 < 0 && !usus_r.map(i => i.IP).includes(IP?.split(":")[3])) {
      usus_r.push({ key: apikey, IP: [IP?.split(":")[3]] });
      fs.writeFileSync("./database/usuarios.json", JSON.stringify(usus_r, null, 2));
    } else if (i3 >= 0 && !usus_r[i3]?.IP.includes(IP?.split(":")[3])) {
      usus_r[i3].IP.push(IP?.split(":")[3]);
      fs.writeFileSync("./database/usuarios.json", JSON.stringify(usus_r, null, 2));
    }
  }
}

export default async function handler(req, res) {
  const apikey = req.query.apikey;
  const url = req.query.url;

  if (!key.map(i => i.apikey)?.includes(apikey)) {
    return res.sendFile(path.join(__dirname, "../public/", "apikey_invalida.html"));
  }

  if (key[key.map(i => i?.apikey)?.indexOf(apikey)]?.request <= 0) {
    return res.json({ message: "Apikey no válida o solicitudes agotadas!" });
  }

  if (!url) {
    return res.json({ status: false, message: "Coloque el parámetro: url" });
  }

  await RG_US(apikey, req);

  try {
    const result = await processAnime(url);
    return res.json(result);
  } catch (err) {
    console.error(err);
    return res.json({ message: "Error en el servidor interno" });
  }
}
const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const router = express.Router();
const ddos = require('ddos');
const acc = require('./scrapers/acortador.js');

var key = JSON.parse(fs.readFileSync("./database/apikeys.json"));
const usus_r = JSON.parse(fs.readFileSync("./database/usuarios.json"));
const ads = JSON.parse(fs.readFileSync("./database/ads.json")); 

async function RG_US(apikey, req) {
    var i4 = key.map(i => i?.apikey)?.indexOf(apikey);
    if (i4 >= 0) {
        key[i4].request -= 1;
        fs.writeFileSync("./database/apikeys.json", JSON.stringify(key, null, 2));
        var IP = req.headers['x-real-ip'] || req.connection.remoteAddress || 0;
        var i3 = usus_r.map(i => i.key).indexOf(apikey);
        if (i3 < 0 && !usus_r.map(i => i.IP).includes(IP?.split(":")[3])) {
            usus_r.push({ key: apikey, IP: [IP?.split(":")[3]] });
            fs.writeFileSync("./database/usuarios.json", JSON.stringify(usus_r, null, 2));
        } else if (i3 >= 0 && !usus_r[i3]?.IP.includes(IP?.split(":")[3])) {
            usus_r[i3].IP.push(IP?.split(":")[3]);
            fs.writeFileSync("./database/usuarios.json", JSON.stringify(usus_r, null, 2));
        }
    }
}

const app = express();
app.use(cors());
app.use(express.static("public"));
app.use(express.json()); 

// Rutas principales

app.get("/", (req, res, next) => {
    console.log("Beep");
    res.end("Boop");
});
app.get('/moderador', (req, res) => {
    res.sendFile(path.join(__dirname, "./public/", "moderador.html"));
});

app.get('/docs', (req, res) => {
    res.sendFile(path.join(__dirname, "./public/", "docs.html"));
});

app.get('/publicidad', (req, res) => {
    res.sendFile(path.join(__dirname, "./public/", "planos.html"));
});

app.get('/api/apikey-check', (req, res) => {
    const apikey = req.query.apikey;
    const index = key.map(i => i?.apikey)?.indexOf(apikey);
    if (index < 0) {
        return res.json({ message: 'Apikey inválida o alcanzó su límite!!' });
    } else {
        RG_US(apikey, req);
        return res.json({ message: `Apikey Funcionando perfectamente ✔️ - Límite: ${key[index]?.request}` });
    }
});

app.get('/api/add-key', (req, res) => {
    a = req.query.a;
    if (!a.includes("&")) return res.json({ message: "falta el &" });
    var [apikey, senha, rq] = a.split("&");
    var senhaofc = "F_Z";
    if (senha != senhaofc) return res.json({ message: "Contraseña invalida.." });
    if (!apikey) return res.json({ message: "¿Dónde está la llave?" });
    if (key.map(i => i.apikey).includes(apikey)) {
        return res.json({ message: "Esta clave ya está incluida dentro del sistema..." });
    } else {
        key.push({ apikey: apikey, request: rq });
        fs.writeFileSync("./database/apikeys.json", JSON.stringify(key));
        return res.json({ message: `Apikey ${apikey} registrada con éxito.` });
    }
});

app.get('/api/del-key', (req, res) => {
    a = req.query.a;
    if (!a.includes("&")) return res.json({ message: "Falta el &" });
    var [apikey, senha] = a.split("&");
    var senhaofc = "F_Z";
    if (senha != senhaofc) return res.json({ message: "Contraseña invalida..." });
    if (!apikey) return res.json({ message: "¿Y la apikey?" });
    if (!key.map(i => i.apikey).includes(apikey)) {
        return res.json({ message: "La apikey no existe..." });
    } else {
        var i2 = key.map(i => i.apikey).indexOf(apikey);
        key.splice(i2, 1);
        fs.writeFileSync("./database/apikeys.json", JSON.stringify(key));
        return res.json({ message: "Apikey eliminada correctamente." });
    }
});

app.post('/api/add-ad', (req, res) => {
    const { title, url, imageUrl, description } = req.body;
    if (!title || !url || !imageUrl || !description) {
        return res.status(400).json({ message: "Faltan campos requeridos." });
    }

    const newAd = { title, url, imageUrl, description };
    ads.push(newAd);
    fs.writeFileSync("./database/ads.json", JSON.stringify(ads, null, 2)); 
    return res.status(201).json({ message: "Anuncio agregado exitosamente." });
});


app.get('/api/get-ads', (req, res) => {
    return res.json(ads); 
});
/**** APIS DE DESCARGA ******/
app.get('/api/animedl', async (req, res, next) => {
    const apikey = req.query.apikey;
    const url = req.query.url;

    if (!key.map(i => i.apikey)?.includes(apikey)) {
        return res.sendFile(path.join(__dirname, "./public/", "apikey_invalida.html"));
    }
    if (key[key.map(i => i?.apikey)?.indexOf(apikey)]?.request <= 0) {
        return res.json({ message: "Apikey no válida o solicitudes agotadas!" });
    }
    if (!url) {
        return res.json({ status: false, message: "Coloque el parámetro: url" });
    }
    RG_US(apikey, req);    

    try {
        const { processAnime } = require('./scrapers/Tioanime.js'); 
        const result = await processAnime(url);
        return res.json(result);

    } catch (e) {
        console.error(e);
        return res.json({ status: false, message: "Ocurrió un error" });
    }
});

app.get('/api/animes', async (req, res, next) => {
    const apikey = req.query.apikey;
    const q = req.query.q;

    if (!key.map(i => i.apikey)?.includes(apikey)) {
        return res.sendFile(path.join(__dirname, "./public/", "apikey_invalida.html"));
    }
    if (key[key.map(i => i?.apikey)?.indexOf(apikey)]?.request <= 0) {
        return res.json({ message: "Apikey no válida o solicitudes agotadas!" });
    }
    if (!q) {
        return res.json({ status: false, message: "Coloque el parámetro: q" });
    }
    RG_US(apikey, req);    

    try {
        const { searchAnime } = require('./scrapers/Tioanime.js'); 
        const result = await searchAnime(q);
        return res.json(result);

    } catch (e) {
        console.error(e);
        return res.json({ status: false, message: "Ocurrió un error" });
    }
});

app.get('/api/openai', async (req, res, next) => {
    const apikey = req.query.apikey;
    const q = req.query.q;
    const user = req.query.user
    if (!key.map(i => i.apikey)?.includes(apikey)) {
        return res.sendFile(path.join(__dirname, "./public/", "apikey_invalida.html"));
    }
    if (key[key.map(i => i?.apikey)?.indexOf(apikey)]?.request <= 0) {
        return res.json({ message: "Apikey no válida o solicitudes agotadas!" });
    }
    if (!q) {
        return res.json({ status: false, message: "Coloque el parámetro: q" });
    }
    RG_US(apikey, req);    

    try {
        const { gpt } = require('./scrapers/openai.js'); 
        const result = await gpt(q, user);
        return res.json(result);

    } catch (e) {
        console.error(e);
        return res.json({ status: false, message: "Ocurrió un error" });
    }
});

app.get('/api/tiktoks', async (req, res, next) => {
    const apikey = req.query.apikey;
    const q = req.query.q;
    if (!key.map(i => i.apikey)?.includes(apikey)) {
        return res.sendFile(path.join(__dirname, "./public/", "apikey_invalida.html"));
    }
    if (key[key.map(i => i?.apikey)?.indexOf(apikey)]?.request <= 0) {
        return res.json({ message: "Apikey no válida o solicitudes agotadas!" });
    }
    if (!q) {
        return res.json({ status: false, message: "Coloque el parámetro: q" });
    }
    RG_US(apikey, req);    

    try {
        const { ttks } = require('./scrapers/tiktoks.js'); 
        const result = await ttks(q);
        return res.json(result);

    } catch (e) {
        console.error(e);
        return res.json({ status: false, message: "Ocurrió un error" });
    }
});

app.get('/api/facebook', async (req, res, next) => {
    const apikey = req.query.apikey;
    const url = req.query.url;
    if (!key.map(i => i.apikey)?.includes(apikey)) {
        return res.sendFile(path.join(__dirname, "./public/", "apikey_invalida.html"));
    }
    if (key[key.map(i => i?.apikey)?.indexOf(apikey)]?.request <= 0) {
        return res.json({ message: "Apikey no válida o solicitudes agotadas!" });
    }
    if (!url) {
        return res.json({ status: false, message: "Coloque el parámetro: url" });
    }
    RG_US(apikey, req);
    try {
        const { fbdl } = require('./scrapers/facebook.js');
        const result = await fbdl(url);
            return result
    } catch (err) {
        console.error(err);
        return res.json({ message: 'Error en el servidor interno' });
    }
});


/***""**************************/
app.use(router);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});


const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path');
const router = express.Router();
const ddos = require('ddos'); // Asegúrate de instalar esta dependencia
const acc = require('./scrapers/acortador.js');

var key = JSON.parse(fs.readFileSync("./database/apikeys.json"));
const usus_r = JSON.parse(fs.readFileSync("./database/usuarios.json"));
const adsFile = path.join(__dirname, "./database/ads.json");

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
//router.use(ddos.express);

// Rutas principales

app.get("/", (req, res, next) => {
    console.log("Beep");
    res.end("Boop");
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
        return res.json({ message: `Apikey ${apikey} borrada con éxito.` });
    }
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

/**** Rutas de publicaciones ****/

// Ruta para obtener todas las publicaciones
app.get('/api/publicaciones', (req, res) => {
    fs.readFile(adsFile, "utf8", (err, data) => {
        if (err) {
            console.error("Error al leer el archivo de publicaciones:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }
        res.json(JSON.parse(data)); // Devuelve las publicaciones en formato JSON
    });
});

// Ruta para agregar una nueva publicación
app.post('/api/publicaciones', express.json(), (req, res) => {
    const nuevaPublicacion = req.body;

    // Validar los campos requeridos
    if (!nuevaPublicacion.titulo || !nuevaPublicacion.link) {
        return res.status(400).json({ message: "El título y el enlace son obligatorios" });
    }

    fs.readFile(adsFile, "utf8", (err, data) => {
        if (err) {
            console.error("Error al leer el archivo de publicaciones:", err);
            return res.status(500).json({ message: "Error interno del servidor" });
        }

        const publicaciones = JSON.parse(data);
        publicaciones.push(nuevaPublicacion); // Agrega la nueva publicación al array

        fs.writeFile(adsFile, JSON.stringify(publicaciones, null, 2), (err) => {
            if (err) {
                console.error("Error al guardar la publicación:", err);
                return res.status(500).json({ message: "Error interno del servidor" });
            }
            res.status(201).json({ message: "Publicación agregada con éxito" });
        });
    });
});

/***""**************************/
// Usar el router
app.use(router);

// Servidor
const PORT = process.env.PORT || 3075;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
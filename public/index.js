// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

const invalidDate = (date) => date.toUTCString() === "Invalid Date";

const parseDate = (dateStr) => {
  return new Date(dateStr); // Apenas tenta criar a data diretamente
};

app.get("/api/diff/:date1/:date2", (req, res) => {
  let startDate = parseDate(req.params.date1);
  let endDate = parseDate(req.params.date2);

  // Verifica se as datas são válidas
  if (invalidDate(startDate)) {
    startDate = new Date(+req.params.date1); // Tenta converter timestamp
  }
  if (invalidDate(endDate)) {
    endDate = new Date(+req.params.date2); // Tenta converter timestamp
  }

  if (invalidDate(startDate) || invalidDate(endDate)) {
    res.json({ error: "Invalid Date" });
    return;
  }

  // Calcula a diferença em milissegundos
  const diffMs = Math.abs(endDate - startDate);

  // Converte a diferença para dias, horas, minutos e segundos
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

  res.json({
    difference: `${diffDays} dias, ${diffHours} horas, ${diffMinutes} minutos, ${diffSeconds} segundos`,
  }); // Retorna a diferença formatada
});

app.get("/api/:date", function (req, res) {
  let date = parseDate(req.params.date);
  const utcOffset = req.query.utc ? parseFloat(req.query.utc) : 0; // UTC padrão é +0

  // Se a data não for válida, tente converter o timestamp
  if (invalidDate(date)) {
    date = new Date(+req.params.date);
  }

  // Se a data ainda não for válida, retorne erro
  if (invalidDate(date)) {
    res.json({ error: "Invalid Date" });
    return;
  }

  // Se o UTC offset for fornecido e válido, aplique-o
  if (!isNaN(utcOffset)) {
    date = new Date(date.getTime() + utcOffset * 3600000); // Aplica o offset em milissegundos
  }

  const formattedDate = date.toLocaleString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  res.json({ date: formattedDate, unix: date.getTime() }); // Inclui o timestamp na resposta
});

app.get("/api", (req, res) => {
  const now = new Date();
  const utcOffset = req.query.utc ? parseFloat(req.query.utc) : 0; // UTC padrão é +0

  // Aplica o UTC offset, se fornecido
  const adjustedNow = !isNaN(utcOffset) ? new Date(now.getTime() + utcOffset * 3600000) : now;

  const formattedDate = adjustedNow.toLocaleString("pt-BR", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  res.json({ date: formattedDate, unix: adjustedNow.getTime() }); // Inclui o timestamp na resposta
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

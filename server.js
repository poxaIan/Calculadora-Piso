const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();

app.use(express.static('public'));
app.use(express.json());

const SHEETDB_URL = 'https://sheetdb.io/api/v1/opi6fgc16nx4q';

app.post('/api/adicionar', async (req, res) => {
  const { categoria, valor } = req.body;

  try {
    const response = await fetch(SHEETDB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        data: {
          Categoria: categoria,
          Valor_Estimado_R: valor
        }
      })
    });

    const data = await response.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar para SheetDB' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

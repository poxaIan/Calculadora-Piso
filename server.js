// server.js
const express = require('express');
const path = require('path');
const multer = require('multer');
const XLSX = require('xlsx');
const fs = require('fs');

const app = express();
app.use(express.static('public'));
app.use(express.json());
const upload = multer();

// NOVA ROTA PARA PROCESSAR CÁLCULO E BUSCA DE INSUMO
app.post('/api/calcular', upload.none(), (req, res) => {
  const dados = req.body;
  const filePath = path.join(__dirname, 'Planilha_Calculo_Piso.xlsm');

  if (!fs.existsSync(filePath)) {
    return res.status(500).json({ error: 'Planilha não encontrada.' });
  }

  // Carrega a planilha de insumos
  const wb = XLSX.readFile(filePath);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const insumos = XLSX.utils.sheet_to_json(ws);

  // Busca insumo correspondente
  const chave = `${dados.codigoFamilia}-${dados.codigoInsumo}`;
  const linha = insumos.find(row => `${row['Código da Família']}-${row['Código do Insumo']}` === chave);

  if (!linha) {
    return res.status(404).json({ error: 'Insumo não encontrado na planilha.' });
  }

  // Cálculos
  const comprimento = parseFloat(dados.comprimento);
  const largura = parseFloat(dados.largura);
  const altura = parseFloat(dados.altura);
  const valorUnitario = parseFloat(dados.valorUnitario);

  const area = comprimento * largura;
  const perimetro = 2 * (comprimento + largura);
  const areaRodape = perimetro * altura;
  const areaComPerda = area * 1.1;
  const valorTotal = areaComPerda * valorUnitario;

  const resultado = {
    area: area.toFixed(2),
    perimetro: perimetro.toFixed(2),
    areaRodape: areaRodape.toFixed(2),
    areaComPerda: areaComPerda.toFixed(2),
    valorTotal: valorTotal.toFixed(2),
    descricao: linha['Descrição do Insumo'],
    unidade: linha['Unidade'],
    categoria: linha['Categoria']
  };

  res.json(resultado);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
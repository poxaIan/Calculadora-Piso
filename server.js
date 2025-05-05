const xlsx = require('xlsx');
const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
app.use(express.static('public'));
app.use(express.json());
const upload = multer();

app.post('/api/calcular', async (req, res) => {
  try {
    console.log("📥 Dados recebidos do formulário:", req.body);

    const {
      codigoFamilia,
      codigoInsumo,
      ambiente,
      pavimento,
      comprimento,
      largura,
      altura,
      valorUnitario
    } = req.body;

    const alturaRodape = altura;

    console.log("🧮 Iniciando cálculos com:");
    console.log(`Código da Família: ${codigoFamilia}`);
    console.log(`Código do Insumo: ${codigoInsumo}`);
    console.log(`Comprimento: ${comprimento}`);
    console.log(`Largura: ${largura}`);
    console.log(`Altura Rodapé: ${alturaRodape}`);
    console.log(`Valor Unitário: ${valorUnitario}`);

    // 🔍 Leitura da planilha
    const workbook = xlsx.readFile('Planilha_Calculo_Piso.xlsm');
    console.log("📚 Abas disponíveis:", workbook.SheetNames);

    const sheet = workbook.Sheets[workbook.SheetNames[1]];
    const dados = xlsx.utils.sheet_to_json(sheet);

    console.log(`📄 Primeira linha da planilha:`, dados[0]);
    const todasChaves = dados.map(i => i.Chave?.toString().trim());
    console.log("🔑 Primeiras chaves disponíveis:", todasChaves.slice(0, 10));

    // 🧩 Buscar chave
    const chave = `${codigoFamilia}-${codigoInsumo}`.trim();
    console.log(`🔍 Buscando pela chave: '${chave}'`);

    const info = dados.find(i => i.Chave?.toString().trim() === chave);

    if (!info) {
      console.log(`❌ Chave '${chave}' não encontrada na planilha`);
      return res.status(404).json({ erro: "Insumo não encontrado" });
    }

    // 🧮 Cálculos
    const area = comprimento * largura;
    const perimetro = 2 * (Number(comprimento) + Number(largura));
    const areaRodape = perimetro * alturaRodape;
    const areaComPerda = area * 1.1;
    const valorTotal = areaComPerda * valorUnitario;

    console.log("✅ Cálculos realizados com sucesso.");

    res.json({
      area,
      perimetro,
      areaRodape,
      areaComPerda,
      valorTotal,
      descricao: info["Descrição do Insumo"],
      unidade: info["Unidade"],
      categoria: info["Categoria"]
    });
  } catch (err) {
    console.error("❌ Erro no cálculo:", err);
    res.status(500).json({ erro: "Erro ao processar cálculo." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

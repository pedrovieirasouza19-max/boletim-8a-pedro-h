// CONFIGURAÇÃO FIXA DO ALUNO - Turma e chamada são estáticas neste projeto
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 28,
  apiUrl: "https://profbt.com.br"
};

// Variável de sessão mantida estritamente em memória dinâmica
let pinSessao = "";

// Dados brutos locais das disciplinas do 8º Ano (usados caso a API retorne null)
let disciplinas = [
  { disciplina: "Língua Portuguesa", tri1: 80, tri2: "84,0", tri3: null, faltas: [2, 7, 0] },
  { disciplina: "Matemática", tri1: 69, tri2: "85,0", tri3: null, faltas: [10, 8, 0] },
  { disciplina: "Ciências", tri1: 85, tri2: "68,0", tri3: null, faltas: [7, 7, 0] },
  { disciplina: "História", tri1: "88,0", tri2: "88,0", tri3: null, faltas: [3, 3, 0] },
  { disciplina: "Geografia", tri1: "72,0", tri2: "66,0", tri3: null, faltas: [2, 1, 0] },
  { disciplina: "Língua Inglesa", tri1: "91,0", tri2: "88,0", tri3: null, faltas: [1, 4, 0] },
  { disciplina: "Arte", tri1: "62,0", tri2: "60,0", tri3: null, faltas: [2, 4, 0] },
  { disciplina: "Educação Física", tri1: "91,0", tri2: "92,0", tri3: null, faltas: [1, 2, 0] },
  { disciplina: "Educação Digital", tri1: "70,0", tri2: "60,0", tri3: null, faltas: [4, 4, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "88,0", tri3: null, faltas: [2, 1, 0] },
  { disciplina: "Estudo Orientado", tri1: "82,0", tri2: "91,0", tri3: null, faltas: [2, 2, 0] },
  { disciplina: "Redação e Leitura", tri1: "60,0", tri2: "75,0", tri3: null, faltas: [3, 6, 0] },
  { disciplina: "Pensamento Lógico", tri1: "100,0", tri2: "83,0", tri3: null, faltas: [0, 4, 0] },
  { disciplina: "Literatura Arte e Movimento", tri1: "77,0", tri2: "80,0", tri3: null, faltas: [0, 3, 0] },
  { disciplina: "Práticas Experimentais", tri1: 76, tri2: "84,0", tri3: null, faltas: [2, 4, 0] }
];

// Função para normalizar notas antigas para a escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numTexto = String(valor).replace(',', '.');
  let num = parseFloat(numTexto);

  if (isNaN(num)) {
    return null;
  }

  if (num >= 0 && num <= 10) {
    return num;
  }

  if (num > 10 && num <= 100) {
    return num / 10;
  }

  return null;
}

// Função para formatar a exibição da nota na tabela
function formatarExibicaoNota(nota) {
  if (nota === null || nota === undefined) {
    return "—";
  }
  return nota.toFixed(1).replace('.', ',');
}

// Conexão com o servidor para abrir o boletim através do PIN
async function autenticarEstudante() {
  const campoPin = document.getElementById("campo-pin");
  const msgAcesso = document.getElementById("mensagem-acesso");
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    msgAcesso.className = "mensagem-status status-erro";
    msgAcesso.textContent = "Por favor, digite o PIN.";
    return;
  }

  msgAcesso.className = "mensagem-status";
  msgAcesso.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 200) {
      const respostaDados = await resposta.json();
      
      pinSessao = pinDigitado;
      campoPin.value = "";
      msgAcesso.textContent = "";

      if (respostaDados && respostaDados.dados && respostaDados.dados.disciplinas) {
        disciplinas = respostaDados.dados.disciplinas;
      }

      document.getElementById("secao-acesso").style.display = "none";
      document.getElementById("conteudo-boletim").style.display = "block";

      carregarBoletim();
    } else if (resposta.status === 401) {
      msgAcesso.className = "mensagem-status status-erro";
      msgAcesso.textContent = "Turma, chamada ou PIN inválidos.";
    } else if (resposta.status === 429) {
      msgAcesso.className = "mensagem-status status-erro";
      msgAcesso.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
    } else {
      msgAcesso.className = "mensagem-status status-erro";
      msgAcesso.textContent = "Erro inesperado do servidor. Tente mais tarde.";
    }
  } catch (erro) {
    msgAcesso.className = "mensagem-status status-erro";
    msgAcesso.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// Função principal que processa os dados e preenche a página
function carregarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let totalDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  disciplinas.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    let totalFaltasDisciplina = 0;
    if (Array.isArray(item.faltas)) {
      totalFaltasDisciplina = item.faltas.reduce((acc, f) => acc + (parseInt(f) || 0), 0);
    } else if (item.faltas !== undefined && item.faltas !== null) {
      totalFaltasDisciplina = parseInt(item.faltas) || 0;
    }
    totalFaltasGeral += totalFaltasDisciplina;

    const notasValidas = [n1, n2, n3].filter(n => n !== null);
    let media = null;
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, n) => acc + n, 0);
      media = soma / notasValidas.length;
      somaMediasGerais += media;
      totalDisciplinasComMedia++;

      if (media >= 6.0) {
        situacao = "Bom desempenho";
        classeSituacao = "situacao-bom";
        qtdBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeSituacao = "situacao-atencao";
        qtdAtencao++;
      }
    }

    const linha = document.createElement("tr");

    const tdNome = document.createElement("td");
    const strongNome = document.createElement("strong");
    strongNome.textContent = item.disciplina;
    tdNome.appendChild(strongNome);

    const tdTri1 = document.createElement("td");
    tdTri1.textContent = formatarExibicaoNota(n1);

    const tdTri2 = document.createElement("td");
    tdTri2.textContent = formatarExibicaoNota(n2);

    const tdTri3 = document.createElement("td");
    tdTri3.textContent = formatarExibicaoNota(n3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = media !== null ? formatarExibicaoNota(media) : "—";
    tdMedia.appendChild(strongMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltasDisciplina;

    const tdSituacao = document.createElement("td");
    tdSituacao.className = classeSituacao;
    tdSituacao.textContent = situacao;

    linha.appendChild(tdNome);
    linha.appendChild(tdTri1);
    linha.appendChild(tdTri2);
    linha.appendChild(tdTri3);
    linha.appendChild(tdMedia);
    linha.appendChild(tdFaltas);
    linha.appendChild(tdSituacao);

    corpoTabela.appendChild(linha);
  });

  const mediaGeralFinal = totalDisciplinasComMedia > 0 
    ? (somaMediasGerais / totalDisciplinasComMedia).toFixed(1).replace('.', ',')
    : "—";

  document.getElementById("media-geral").textContent = mediaGeralFinal;
  document.getElementById("total-faltas").textContent = totalFaltasGeral;
  document.getElementById("bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("precisam-atencao").textContent = qtdAtencao;
}

// Abre a janela de edição
function abrirEditor() {
  const corpoEditor = document.getElementById("corpo-editor");
  corpoEditor.innerHTML = "";
  document.getElementById("mensagem-salvar").textContent = "";

  disciplinas.forEach((item, index) => {
    const linha = document.createElement("tr");

    const extrairInputNota = (valor) => {
      if (valor === null || valor === undefined || valor === "") return "";
      return String(valor).trim();
    };

    const obterFaltaPorTrimestre = (faltasInput, tIdx) => {
      if (Array.isArray(faltasInput)) return faltasInput[tIdx] !== undefined ? faltasInput[tIdx] : 0;
      return tIdx === 0 ? (faltasInput || 0) : 0; 
    };

    linha.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td><input type="text" id="n1-${index}" value="${extrairInputNota(item.tri1)}"></td>
      <td><input type="text" id="n2-${index}" value="${extrairInputNota(item.tri2)}"></td>
      <td><input type="text" id="n3-${index}" value="${extrairInputNota(item.tri3)}"></td>
      <td><input type="text" id="f1-${index}" value="${obterFaltaPorTrimestre(item.faltas, 0)}"></td>
      <td><input type="text" id="f2-${index}" value="${obterFaltaPorTrimestre(item.faltas, 1)}"></td>
      <td><input type="text" id="f3-${index}" value="${obterFaltaPorTrimestre(item.faltas, 2)}"></td>
    `;

    corpoEditor.appendChild(linha);
  });

  document.getElementById("modal-editor").style.display = "flex";
}

// Fecha a tela de edição
function fecharEditor() {
  document.getElementById("modal-editor").style.display = "none";
}

// Processa, valida e envia os dados editados
async function salvarAlteracoes() {
  const msgSalvar = document.getElementById("mensagem-salvar");
  let validacaoOk = true;
  const novasDisciplinas = [];

  // Remove marcações de erros anteriores
  const inputs = document.querySelectorAll(".tabela-editor-container input");
  inputs.forEach(inp => inp.classList.remove("campo-invalido"));

  for (let i = 0; i < disciplinas.length; i++) {
    const inpN1 = document.getElementById(`n1-${i}`);
    const inpN2 = document.getElementById(`n2-${i}`);
    const inpN3 = document.getElementById(`n3-${i}`);
    const inpF1 = document.getElementById(`f1-${i}`);
    const inpF2 = document.getElementById(`f2-${i}`);
    const inpF3 = document.getElementById(`f3-${i}`);

    const validarEConverterNota = (inputElement) => {
      const v = inputElement.value.trim();
      if (v === "") return null;

      if (/^\d{2,3}$/.test(v)) {
        const nCheck = parseFloat(v);
        if (nCheck > 10) {
          inputElement.classList.add("campo-invalido");
          validacaoOk = false;
          return null;
        }
      }

      const textoLimpo = v.replace(',', '.');
      const num = parseFloat(textoLimpo);

      if (isNaN(num) || num < 0 || num > 10 || !/^\d+(\.\d+)?$/.test(textoLimpo)) {
        inputElement.classList.add("campo-invalido");
        validacaoOk = false;
        return null;
      }

      return num;
    };

    const validarEConverterFalta = (inputElement) => {
      const v = inputElement.value.trim();
      if (!/^\d+$/.test(v)) {
        inputElement.classList.add("campo-invalido");
        validacaoOk = false;
        return null;
      }

      const num = parseInt(v, 10);
      if (num < 0) {
        inputElement.classList.add("campo-invalido");
        validacaoOk = false;
        return null;
      }

      return num;
    };

    const n1 = validarEConverterNota(inpN1);
    const n2 = validarEConverterNota(inpN2);
    const n3 = validarEConverterNota(inpN3);
    const f1 = validarEConverterFalta(inpF1);
    const f2 = validarEConverterFalta(inpF2);
    const f3 = validarEConverterFalta(inpF3);

    novasDisciplinas.push({// CONFIGURAÇÃO FIXA DO ALUNO - Turma e chamada são estáticas neste projeto
const CONFIG_ALUNO = {
  turma: "8A",
  numeroChamada: 28,
  apiUrl: "https://profbt.com.br"
};

// Variável de sessão mantida estritamente em memória dinâmica
let pinSessao = "";

// Dados brutos locais das disciplinas do 8º Ano (usados caso a API retorne null)
let disciplinas = [
  { disciplina: "Língua Portuguesa", tri1: 80, tri2: "84,0", tri3: null, faltas: [2, 7, 0] },
  { disciplina: "Matemática", tri1: 69, tri2: "85,0", tri3: null, faltas: [10, 8, 0] },
  { disciplina: "Ciências", tri1: 85, tri2: "68,0", tri3: null, faltas: [7, 7, 0] },
  { disciplina: "História", tri1: "88,0", tri2: "88,0", tri3: null, faltas: [3, 3, 0] },
  { disciplina: "Geografia", tri1: "72,0", tri2: "66,0", tri3: null, faltas: [2, 1, 0] },
  { disciplina: "Língua Inglesa", tri1: "91,0", tri2: "88,0", tri3: null, faltas: [1, 4, 0] },
  { disciplina: "Arte", tri1: "62,0", tri2: "60,0", tri3: null, faltas: [2, 4, 0] },
  { disciplina: "Educação Física", tri1: "91,0", tri2: "92,0", tri3: null, faltas: [1, 2, 0] },
  { disciplina: "Educação Digital", tri1: "70,0", tri2: "60,0", tri3: null, faltas: [4, 4, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "88,0", tri3: null, faltas: [2, 1, 0] },
  { disciplina: "Estudo Orientado", tri1: "82,0", tri2: "91,0", tri3: null, faltas: [2, 2, 0] },
  { disciplina: "Redação e Leitura", tri1: "60,0", tri2: "75,0", tri3: null, faltas: [3, 6, 0] },
  { disciplina: "Pensamento Lógico", tri1: "100,0", tri2: "83,0", tri3: null, faltas: [0, 4, 0] },
  { disciplina: "Literatura Arte e Movimento", tri1: "77,0", tri2: "80,0", tri3: null, faltas: [0, 3, 0] },
  { disciplina: "Práticas Experimentais", tri1: 76, tri2: "84,0", tri3: null, faltas: [2, 4, 0] }
];

// Função para normalizar notas antigas para a escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  let numTexto = String(valor).replace(',', '.');
  let num = parseFloat(numTexto);

  if (isNaN(num)) {
    return null;
  }

  if (num >= 0 && num <= 10) {
    return num;
  }

  if (num > 10 && num <= 100) {
    return num / 10;
  }

  return null;
}

// Função para formatar a exibição da nota na tabela
function formatarExibicaoNota(nota) {
  if (nota === null || nota === undefined) {
    return "—";
  }
  return nota.toFixed(1).replace('.', ',');
}

// Conexão com o servidor para abrir o boletim através do PIN
async function autenticarEstudante() {
  const campoPin = document.getElementById("campo-pin");
  const msgAcesso = document.getElementById("mensagem-acesso");
  const pinDigitado = campoPin.value.trim();

  if (!pinDigitado) {
    msgAcesso.className = "mensagem-status status-erro";
    msgAcesso.textContent = "Por favor, digite o PIN.";
    return;
  }

  msgAcesso.className = "mensagem-status";
  msgAcesso.textContent = "Conectando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinDigitado
      })
    });

    if (resposta.status === 200) {
      const respostaDados = await resposta.json();
      
      pinSessao = pinDigitado;
      campoPin.value = "";
      msgAcesso.textContent = "";

      if (respostaDados && respostaDados.dados && respostaDados.dados.disciplinas) {
        disciplinas = respostaDados.dados.disciplinas;
      }

      document.getElementById("secao-acesso").style.display = "none";
      document.getElementById("conteudo-boletim").style.display = "block";

      carregarBoletim();
    } else if (resposta.status === 401) {
      msgAcesso.className = "mensagem-status status-erro";
      msgAcesso.textContent = "Turma, chamada ou PIN inválidos.";
    } else if (resposta.status === 429) {
      msgAcesso.className = "mensagem-status status-erro";
      msgAcesso.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
    } else {
      msgAcesso.className = "mensagem-status status-erro";
      msgAcesso.textContent = "Erro inesperado do servidor. Tente mais tarde.";
    }
  } catch (erro) {
    msgAcesso.className = "mensagem-status status-erro";
    msgAcesso.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
  }
}

// Função principal que processa os dados e preenche a página
function carregarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let totalDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  disciplinas.forEach(item => {
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    let totalFaltasDisciplina = 0;
    if (Array.isArray(item.faltas)) {
      totalFaltasDisciplina = item.faltas.reduce((acc, f) => acc + (parseInt(f) || 0), 0);
    } else if (item.faltas !== undefined && item.faltas !== null) {
      totalFaltasDisciplina = parseInt(item.faltas) || 0;
    }
    totalFaltasGeral += totalFaltasDisciplina;

    const notasValidas = [n1, n2, n3].filter(n => n !== null);
    let media = null;
    let situacao = "Nota ainda não disponível";
    let classeSituacao = "situacao-indisponivel";

    if (notasValidas.length > 0) {
      const soma = notasValidas.reduce((acc, n) => acc + n, 0);
      media = soma / notasValidas.length;
      somaMediasGerais += media;
      totalDisciplinasComMedia++;

      if (media >= 6.0) {
        situacao = "Bom desempenho";
        classeSituacao = "situacao-bom";
        qtdBomDesempenho++;
      } else {
        situacao = "Atenção";
        classeSituacao = "situacao-atencao";
        qtdAtencao++;
      }
    }

    const linha = document.createElement("tr");

    const tdNome = document.createElement("td");
    const strongNome = document.createElement("strong");
    strongNome.textContent = item.disciplina;
    tdNome.appendChild(strongNome);

    const tdTri1 = document.createElement("td");
    tdTri1.textContent = formatarExibicaoNota(n1);

    const tdTri2 = document.createElement("td");
    tdTri2.textContent = formatarExibicaoNota(n2);

    const tdTri3 = document.createElement("td");
    tdTri3.textContent = formatarExibicaoNota(n3);

    const tdMedia = document.createElement("td");
    const strongMedia = document.createElement("strong");
    strongMedia.textContent = media !== null ? formatarExibicaoNota(media) : "—";
    tdMedia.appendChild(strongMedia);

    const tdFaltas = document.createElement("td");
    tdFaltas.textContent = totalFaltasDisciplina;

    const tdSituacao = document.createElement("td");
    tdSituacao.className = classeSituacao;
    tdSituacao.textContent = situacao;

    linha.appendChild(tdNome);
    linha.appendChild(tdTri1);
    linha.appendChild(tdTri2);
    linha.appendChild(tdTri3);
    linha.appendChild(tdMedia);
    linha.appendChild(tdFaltas);
    linha.appendChild(tdSituacao);

    corpoTabela.appendChild(linha);
  });

  const mediaGeralFinal = totalDisciplinasComMedia > 0 
    ? (somaMediasGerais / totalDisciplinasComMedia).toFixed(1).replace('.', ',')
    : "—";

  document.getElementById("media-geral").textContent = mediaGeralFinal;
  document.getElementById("total-faltas").textContent = totalFaltasGeral;
  document.getElementById("bom-desempenho").textContent = qtdBomDesempenho;
  document.getElementById("precisam-atencao").textContent = qtdAtencao;
}

// Abre a janela de edição
function abrirEditor() {
  const corpoEditor = document.getElementById("corpo-editor");
  corpoEditor.innerHTML = "";
  document.getElementById("mensagem-salvar").textContent = "";

  disciplinas.forEach((item, index) => {
    const linha = document.createElement("tr");

    const extrairInputNota = (valor) => {
      if (valor === null || valor === undefined || valor === "") return "";
      return String(valor).trim();
    };

    const obterFaltaPorTrimestre = (faltasInput, tIdx) => {
      if (Array.isArray(faltasInput)) return faltasInput[tIdx] !== undefined ? faltasInput[tIdx] : 0;
      return tIdx === 0 ? (faltasInput || 0) : 0; 
    };

    linha.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td><input type="text" id="n1-${index}" value="${extrairInputNota(item.tri1)}"></td>
      <td><input type="text" id="n2-${index}" value="${extrairInputNota(item.tri2)}"></td>
      <td><input type="text" id="n3-${index}" value="${extrairInputNota(item.tri3)}"></td>
      <td><input type="text" id="f1-${index}" value="${obterFaltaPorTrimestre(item.faltas, 0)}"></td>
      <td><input type="text" id="f2-${index}" value="${obterFaltaPorTrimestre(item.faltas, 1)}"></td>
      <td><input type="text" id="f3-${index}" value="${obterFaltaPorTrimestre(item.faltas, 2)}"></td>
    `;

    corpoEditor.appendChild(linha);
  });

  document.getElementById("modal-editor").style.display = "flex";
}

// Fecha a tela de edição
function fecharEditor() {
  document.getElementById("modal-editor").style.display = "none";
}

// Processa, valida e envia os dados editados
async function salvarAlteracoes() {
  const msgSalvar = document.getElementById("mensagem-salvar");
  let validacaoOk = true;
  const novasDisciplinas = [];

  // Remove marcações de erros anteriores
  const inputs = document.querySelectorAll(".tabela-editor-container input");
  inputs.forEach(inp => inp.classList.remove("campo-invalido"));

  for (let i = 0; i < disciplinas.length; i++) {
    const inpN1 = document.getElementById(`n1-${i}`);
    const inpN2 = document.getElementById(`n2-${i}`);
    const inpN3 = document.getElementById(`n3-${i}`);
    const inpF1 = document.getElementById(`f1-${i}`);
    const inpF2 = document.getElementById(`f2-${i}`);
    const inpF3 = document.getElementById(`f3-${i}`);

    const validarEConverterNota = (inputElement) => {
      const v = inputElement.value.trim();
      if (v === "") return null;

      if (/^\d{2,3}$/.test(v)) {
        const nCheck = parseFloat(v);
        if (nCheck > 10) {
          inputElement.classList.add("campo-invalido");
          validacaoOk = false;
          return null;
        }
      }

      const textoLimpo = v.replace(',', '.');
      const num = parseFloat(textoLimpo);

      if (isNaN(num) || num < 0 || num > 10 || !/^\d+(\.\d+)?$/.test(textoLimpo)) {
        inputElement.classList.add("campo-invalido");
        validacaoOk = false;
        return null;
      }

      return num;
    };

    const validarEConverterFalta = (inputElement) => {
      const v = inputElement.value.trim();
      if (!/^\d+$/.test(v)) {
        inputElement.classList.add("campo-invalido");
        validacaoOk = false;
        return null;
      }

      const num = parseInt(v, 10);
      if (num < 0) {
        inputElement.classList.add("campo-invalido");
        validacaoOk = false;
        return null;
      }

      return num;
    };

    const n1 = validarEConverterNota(inpN1);
    const n2 = validarEConverterNota(inpN2);
    const n3 = validarEConverterNota(inpN3);
    const f1 = validarEConverterFalta(inpF1);
    const f2 = validarEConverterFalta(inpF2);
    const f3 = validarEConverterFalta(inpF3);(index):1 Access to fetch at 'https://profbt.com.br/api/v1/boletins/abrir' from origin 'https://boletim-8a-pedro-h.vercel.app' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
script.js:78  POST https://profbt.com.br/api/v1/boletins/abrir net::ERR_FAILED
autenticarEstudante @ script.js:78
onclick @ (index):22


    novasDisciplinas.push({
      disciplina: disciplinas[i].disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      faltas: [f1, f2, f3]
    });
  }

  if (!validacaoOk) {
    msgSalvar.className = "mensagem-status status-erro";
    msgSalvar.textContent = "Existem campos com valores inválidos. Corrija-os para salvar.";
    return;
  }

  msgSalvar.className = "mensagem-status";
  msgSalvar.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (resposta.status === 200) {
      disciplinas = novasDisciplinas;
      carregarBoletim();
      fecharEditor();
      alert("Dados salvos com sucesso.");
    } else {
      msgSalvar.className = "mensagem-status status-erro";
      msgSalvar.textContent = "Erro do servidor ao salvar as alterações. Tente novamente.";
    }
  } catch (erro) {
    msgSalvar.className = "mensagem-status status-erro";
    msgSalvar.textContent = "Falha de rede. Não foi possível salvar as alterações.";
  }
}
      disciplina: disciplinas[i].disciplina,
      tri1: n1,
      tri2: n2,
      tri3: n3,
      faltas: [f1, f2, f3]
    });
  }

  if (!validacaoOk) {
    msgSalvar.className = "mensagem-status status-erro";
    msgSalvar.textContent = "Existem campos com valores inválidos. Corrija-os para salvar.";
    return;
  }

  msgSalvar.className = "mensagem-status";
  msgSalvar.textContent = "Salvando...";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: CONFIG_ALUNO.turma,
        numero_chamada: CONFIG_ALUNO.numeroChamada,
        pin: pinSessao,
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (resposta.status === 200) {
      disciplinas = novasDisciplinas;
      carregarBoletim();
      fecharEditor();
      alert("Dados salvos com sucesso.");
    } else {
      msgSalvar.className = "mensagem-status status-erro";
      msgSalvar.textContent = "Erro do servidor ao salvar as alterações. Tente novamente.";
    }
  } catch (erro) {
    msgSalvar.className = "mensagem-status status-erro";
    msgSalvar.textContent = "Falha de rede. Não foi possível salvar as alterações.";
  }
}
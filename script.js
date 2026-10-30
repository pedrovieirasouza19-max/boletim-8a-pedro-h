// PIN de acesso configurado
const PIN_CORRETO = "1234";

// Estrutura de dados com notas e faltas atualizadas do boletim
let disciplinas = [
  { nome: "Língua Portuguesa", tri1: 8.0, tri2: 8.4, tri3: 0, f1: 2, f2: 7, f3: 0 },
  { nome: "Matemática", tri1: 6.9, tri2: 8.5, tri3: 0, f1: 10, f2: 8, f3: 0 },
  { nome: "Ciências", tri1: 8.5, tri2: 6.8, tri3: 0, f1: 7, f2: 7, f3: 0 },
  { nome: "História", tri1: 8.8, tri2: 8.8, tri3: 0, f1: 3, f2: 3, f3: 0 },
  { nome: "Geografia", tri1: 7.2, tri2: 6.6, tri3: 0, f1: 2, f2: 1, f3: 0 },
  { nome: "Língua Inglesa", tri1: 9.1, tri2: 8.8, tri3: 0, f1: 1, f2: 4, f3: 0 },
  { nome: "Arte", tri1: 6.2, tri2: 6.0, tri3: 0, f1: 2, f2: 4, f3: 0 },
  { nome: "Educação Física", tri1: 9.1, tri2: 9.2, tri3: 0, f1: 1, f2: 2, f3: 0 },
  { nome: "Educação Digital", tri1: 7.0, tri2: 6.0, tri3: 0, f1: 4, f2: 4, f3: 0 },
  { nome: "Educação Financeira", tri1: 7.6, tri2: 8.8, tri3: 0, f1: 2, f2: 1, f3: 0 },
  { nome: "Estudo Orientado", tri1: 8.2, tri2: 9.1, tri3: 0, f1: 2, f2: 2, f3: 0 },
  { nome: "Redação e Leitura", tri1: 6.0, tri2: 7.5, tri3: 0, f1: 3, f2: 6, f3: 0 },
  { nome: "Pensamento Lógico", tri1: 10.0, tri2: 8.3, tri3: 0, f1: 0, f2: 4, f3: 0 },
  { nome: "Literatura Arte e Movimento", tri1: 7.7, tri2: 8.0, tri3: 0, f1: 0, f2: 3, f3: 0 },
  { nome: "Práticas Experimentais", tri1: 7.6, tri2: 8.4, tri3: 0, f1: 2, f2: 4, f3: 0 }
];

// Instâncias globais dos gráficos
let graficoMedias = null;
let graficoEvolucao = null;
let graficoFaltas = null;

// 1. Autenticação por PIN
function autenticarEstudante() {
  const pinInput = document.getElementById("campo-pin").value;
  const msgAcesso = document.getElementById("mensagem-acesso");

  if (pinInput === PIN_CORRETO) {
    document.getElementById("secao-acesso").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";
    renderizarTabela();
  } else {
    msgAcesso.className = "mensagem-status status-erro";
    msgAcesso.textContent = "PIN incorreto. Tente novamente!";
  }
}

// 2. Desenha a tabela principal e atualiza os cards de resumo
function renderizarTabela() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMedias = 0;
  let totalFaltasGeral = 0;
  let bomDesempenho = 0;
  let precisamAtencao = 0;

  disciplinas.forEach(item => {
    // Calcula a média considerando apenas os trimestres com notas lançadas
    const trimestresComNota = [item.tri1, item.tri2, item.tri3].filter(n => n > 0).length || 1;
    const media = (item.tri1 + item.tri2 + item.tri3) / trimestresComNota;
    const totalFaltas = item.f1 + item.f2 + item.f3;

    somaMedias += media;
    totalFaltasGeral += totalFaltas;

    let situacao = "";
    let classeBadge = "";

    if (media >= 7.0) {
      situacao = "Aprovado";
      classeBadge = "status-aprovado";
      bomDesempenho++;
    } else if (media >= 5.0) {
      situacao = "Recuperação";
      classeBadge = "status-atencao";
      precisamAtencao++;
    } else {
      situacao = "Reprovado";
      classeBadge = "status-reprovado";
      precisamAtencao++;
    }

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.nome}</strong></td>
      <td>${item.tri1.toFixed(1)}</td>
      <td>${item.tri2.toFixed(1)}</td>
      <td>${item.tri3 > 0 ? item.tri3.toFixed(1) : '-'}</td>
      <td><strong>${media.toFixed(1)}</strong></td>
      <td>${totalFaltas}</td>
      <td><span class="badge ${classeBadge}">${situacao}</span></td>
    `;
    corpoTabela.appendChild(tr);
  });

  // Atualiza os Cards Superiores
  const mediaGeral = (somaMedias / disciplinas.length).toFixed(1);
  document.getElementById("media-geral").textContent = mediaGeral;
  document.getElementById("total-faltas").textContent = totalFaltasGeral;
  document.getElementById("bom-desempenho").textContent = bomDesempenho;
  document.getElementById("precisam-atencao").textContent = precisamAtencao;

  // Atualização dos gráficos após renderizar tabela
  atualizarGraficos();
}

// 3. Abre o modal de edição com as notas/faltas atuais
function abrirEditor() {
  const corpoEditor = document.getElementById("corpo-editor");
  corpoEditor.innerHTML = "";

  disciplinas.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${item.nome}</strong></td>
      <td><input type="number" step="0.1" min="0" max="10" id="t1-${index}" value="${item.tri1}"></td>
      <td><input type="number" step="0.1" min="0" max="10" id="t2-${index}" value="${item.tri2}"></td>
      <td><input type="number" step="0.1" min="0" max="10" id="t3-${index}" value="${item.tri3}"></td>
      <td><input type="number" min="0" id="f1-${index}" value="${item.f1}"></td>
      <td><input type="number" min="0" id="f2-${index}" value="${item.f2}"></td>
      <td><input type="number" min="0" id="f3-${index}" value="${item.f3}"></td>
    `;
    corpoEditor.appendChild(tr);
  });

  document.getElementById("modal-editor").style.display = "flex";
}

// 4. Salva as alterações feitas no modal
function salvarAlteracoes() {
  disciplinas.forEach((item, index) => {
    const t1 = parseFloat(document.getElementById(`t1-${index}`).value) || 0;
    const t2 = parseFloat(document.getElementById(`t2-${index}`).value) || 0;
    const t3 = parseFloat(document.getElementById(`t3-${index}`).value) || 0;

    const f1 = parseInt(document.getElementById(`f1-${index}`).value) || 0;
    const f2 = parseInt(document.getElementById(`f2-${index}`).value) || 0;
    const f3 = parseInt(document.getElementById(`f3-${index}`).value) || 0;

    // Limita as notas entre 0 e 10
    item.tri1 = Math.min(10, Math.max(0, t1));
    item.tri2 = Math.min(10, Math.max(0, t2));
    item.tri3 = Math.min(10, Math.max(0, t3));

    // Garante que faltas não sejam negativas
    item.f1 = Math.max(0, f1);
    item.f2 = Math.max(0, f2);
    item.f3 = Math.max(0, f3);
  });

  renderizarTabela();
  fecharEditor();
}

// 5. Fecha o modal de edição
function fecharEditor() {
  document.getElementById("modal-editor").style.display = "none";
}

/* ==========================================================================
   FUNÇÕES EXCLUSIVAS DOS GRÁFICOS (SOMENTE LEITURA DO ESTADO)
   ========================================================================== */

function atualizarGraficoMedias() {
  const ctx = document.getElementById("graficoMediasDisciplinas");
  if (!ctx) return;

  if (graficoMedias) {
    graficoMedias.destroy();
  }

  const rotulos = disciplinas.map(d => d.nome);
  const valoresMedias = disciplinas.map(d => {
    const trimestresComNota = [d.tri1, d.tri2, d.tri3].filter(n => n > 0).length;
    if (trimestresComNota === 0) return null;
    return Number(((d.tri1 + d.tri2 + d.tri3) / trimestresComNota).toFixed(1));
  });

  graficoMedias = new Chart(ctx, {
    type: "bar",
    data: {
      labels: rotulos,
      datasets: [{
        label: "Média Atual",
        data: valoresMedias,
        backgroundColor: "#58a6ff",
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const valor = context.raw;
              return valor !== null ? `Média: ${valor.toFixed(1)}` : "Sem notas";
            }
          }
        }
      },
      scales: {
        x: {
          min: 0,
          max: 10,
          grid: { color: "#21262d" },
          ticks: { color: "#8b949e" }
        },
        y: {
          grid: { display: false },
          ticks: { color: "#c9d1d9", font: { size: 11 } }
        }
      }
    }
  });
}

function atualizarGraficoEvolucao() {
  const ctx = document.getElementById("graficoEvolucaoTrimestres");
  if (!ctx) return;

  if (graficoEvolucao) {
    graficoEvolucao.destroy();
  }

  const calcularMediaTrimestre = (prop) => {
    const notasValidas = disciplinas.map(d => d[prop]).filter(n => n > 0);
    if (notasValidas.length === 0) return null;
    const soma = notasValidas.reduce((acc, curr) => acc + curr, 0);
    return Number((soma / notasValidas.length).toFixed(1));
  };

  const medTri1 = calcularMediaTrimestre("tri1");
  const medTri2 = calcularMediaTrimestre("tri2");
  const medTri3 = calcularMediaTrimestre("tri3");

  graficoEvolucao = new Chart(ctx, {
    type: "line",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Média Geral",
        data: [medTri1, medTri2, medTri3],
        borderColor: "#3fb950",
        backgroundColor: "rgba(63, 185, 80, 0.15)",
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
        pointBackgroundColor: "#3fb950"
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              const valor = context.raw;
              return valor !== null ? `Média Geral: ${valor.toFixed(1)}` : "Sem notas lançadas";
            }
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 10,
          grid: { color: "#21262d" },
          ticks: { color: "#8b949e" }
        },
        x: {
          grid: { color: "#21262d" },
          ticks: { color: "#c9d1d9" }
        }
      }
    }
  });
}

function atualizarGraficoFaltas() {
  const ctx = document.getElementById("graficoFaltasTrimestres");
  const estadoFaltasDiv = document.getElementById("estadoFaltas");
  const cardFaltas = document.getElementById("card-faltas");

  if (!ctx) return;

  if (graficoFaltas) {
    graficoFaltas.destroy();
  }

  const faltasTri1 = disciplinas.reduce((acc, curr) => acc + (curr.f1 || 0), 0);
  const faltasTri2 = disciplinas.reduce((acc, curr) => acc + (curr.f2 || 0), 0);
  const faltasTri3 = disciplinas.reduce((acc, curr) => acc + (curr.f3 || 0), 0);

  const totalFaltasInterno = faltasTri1 + faltasTri2 + faltasTri3;
  const REFERENCIA_RISCO = 350;

  if (totalFaltasInterno >= REFERENCIA_RISCO) {
    if (estadoFaltasDiv) estadoFaltasDiv.innerHTML = `<span class="badge-perigo">Perigo</span>`;
    if (cardFaltas) cardFaltas.classList.add("card-perigo");
  } else {
    if (estadoFaltasDiv) estadoFaltasDiv.innerHTML = "";
    if (cardFaltas) cardFaltas.classList.remove("card-perigo");
  }

  graficoFaltas = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["1º Tri", "2º Tri", "3º Tri"],
      datasets: [{
        label: "Faltas",
        data: [faltasTri1, faltasTri2, faltasTri3],
        backgroundColor: ["#d29922", "#f85149", "#a371f7"],
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw} faltas`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: "#21262d" },
          ticks: { color: "#8b949e", precision: 0 }
        },
        x: {
          grid: { display: false },
          ticks: { color: "#c9d1d9" }
        }
      }
    }
  });
}

function atualizarGraficos() {
  atualizarGraficoMedias();
  atualizarGraficoEvolucao();
  atualizarGraficoFaltas();
}
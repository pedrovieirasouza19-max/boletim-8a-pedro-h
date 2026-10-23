// PIN padrão de acesso
const PIN_CORRETO = "1234";

// Estrutura de dados das disciplinas com notas e faltas por trimestre
let disciplinas = [
  { nome: "Língua Portuguesa", tri1: 8.5, tri2: 7.0, tri3: 8.0, f1: 1, f2: 0, f3: 2 },
  { nome: "Matemática", tri1: 6.0, tri2: 5.5, tri3: 6.5, f1: 2, f2: 1, f3: 1 },
  { nome: "História", tri1: 9.0, tri2: 8.5, tri3: 9.5, f1: 0, f2: 0, f3: 0 },
  { nome: "Geografia", tri1: 7.5, tri2: 8.0, tri3: 7.0, f1: 1, f2: 1, f3: 0 },
  { nome: "Ciências", tri1: 8.0, tri2: 7.5, tri3: 8.5, f1: 0, f2: 2, f3: 1 },
  { nome: "Inglês", tri1: 9.5, tri2: 9.0, tri3: 10.0, f1: 0, f2: 0, f3: 0 },
  { nome: "Educação Física", tri1: 10.0, tri2: 9.5, tri3: 10.0, f1: 0, f2: 0, f3: 0 },
  { nome: "Arte", tri1: 8.0, tri2: 8.5, tri3: 9.0, f1: 0, f2: 0, f3: 0 }
];

// 1. Autenticação por PIN
function autenticarEstudante() {
  const pinInput = document.getElementById("campo-pin").value;
  const msgAcesso = document.getElementById("mensagem-acesso");

  if (pinInput === PIN_CORRETO) {
    document.getElementById("secao-acesso").style.display = "none";
    document.getElementById("conteudo-boletim").style.display = "block";
    renderizarTabela();
  } else {
    msgAcesso.style.color = "#d9534f";
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
    const media = (item.tri1 + item.tri2 + item.tri3) / 3;
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
      <td>${item.tri3.toFixed(1)}</td>
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
}

// 3. Abre a janela (modal) de edição com as notas/faltas atuais
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
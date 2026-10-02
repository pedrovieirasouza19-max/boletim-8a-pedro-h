// Dados brutos das disciplinas do 8º Ano atualizados (Notas e Faltas)
const disciplinas = [
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

// Nota: A frequência geral exibida nos cards é puramente demonstrativa para esta etapa.

// Função para normalizar notas para a escala de 0 a 10
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null; // Nota não lançada
  }

  // Converte para texto e troca vírgula por ponto para poder transformar em número
  let numTexto = String(valor).replace(',', '.');
  let num = parseFloat(numTexto);

  // Se não for um número válido
  if (isNaN(num)) {
    return null;
  }

  // Se o valor estiver entre 0 e 10
  if (num >= 0 && num <= 10) {
    return num;
  }

  // Se o valor for maior que 10 e menor ou igual a 100 (ex: 82 vira 8.2, 100 vira 10.0)
  if (num > 10 && num <= 100) {
    return num / 10;
  }

  // Valores fora dessas regras são considerados inválidos
  return null;
}

// Função para formatar a exibição da nota na tabela
function formatarExibicaoNota(nota) {
  if (nota === null) {
    return "—";
  }
  return nota.toFixed(1).replace('.', ',');
}

// Função principal que processa os dados e preenche a página (DOM)
function carregarBoletim() {
  const corpoTabela = document.getElementById("corpo-tabela");
  corpoTabela.innerHTML = "";

  let somaMediasGerais = 0;
  let totalDisciplinasComMedia = 0;
  let totalFaltasGeral = 0;
  let qtdBomDesempenho = 0;
  let qtdAtencao = 0;

  disciplinas.forEach(item => {
    // Normalização das notas dos 3 trimestres
    const n1 = normalizarNota(item.tri1);
    const n2 = normalizarNota(item.tri2);
    const n3 = normalizarNota(item.tri3);

    // Soma das faltas da disciplina
    const totalFaltasDisciplina = item.faltas.reduce((acc, f) => acc + f, 0);
    totalFaltasGeral += totalFaltasDisciplina;

    // Cálculo da média considerando apenas notas válidas disponíveis
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

    // Criando a linha da tabela para a disciplina no HTML
    const linha = document.createElement("tr");
    linha.innerHTML = `
      <td><strong>${item.disciplina}</strong></td>
      <td>${formatarExibicaoNota(n1)}</td>
      <td>${formatarExibicaoNota(n2)}</td>
      <td>${formatarExibicaoNota(n3)}</td>
      <td><strong>${media !== null ? formatarExibicaoNota(media) : "—"}</strong></td>
      <td>${totalFaltasDisciplina}</td>
      <td class="${classeSituacao}">${situacao}</td>
    `;
    corpoTabela.appendChild(linha);
  });

  // Atualizando os Cards de Resumo na parte superior
  const mediaGeralFinal = totalDisciplinasComMedia > 0 
    ? (somaMediasGerais / totalDisciplinasComMedia).toFixed(1).replace('.', ',')
    : "—";

  document.getElementById("media-geral").innerText = mediaGeralFinal;
  document.getElementById("total-faltas").innerText = totalFaltasGeral;
  document.getElementById("bom-desempenho").innerText = qtdBomDesempenho;
  document.getElementById("precisam-atencao").innerText = qtdAtencao;
}

// Executa a função quando a página carrega completamente
document.addEventListener("DOMContentLoaded", carregarBoletim);
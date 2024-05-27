// Função para calcular a emissão mensal de CO2
function calcularEmissaoMensal(quantidadeCombustao, quantidadeEletricos) {
    // Constantes para a emissão de CO2 por ônibus
    const emissaoCombustao = 100 / 12; // kg CO2/mês por ônibus a combustão
    const emissaoEletricos = 0; // kg CO2/mês por ônibus elétrico

    // Calculando a emissão total mensal
    const emissaoTotalMensal = (quantidadeCombustao * emissaoCombustao) + (quantidadeEletricos * emissaoEletricos);

    return emissaoTotalMensal;
}

// Função principal
async function main() {
    // Perguntando ao usuário a quantidade de ônibus a combustão e elétricos na frota
    const { value: quantidadeCombustao } = await Swal.fire({
        title: 'Quantidade de ônibus a combustão na frota:',
        input: 'number',
        inputAttributes: {
            min: 0
        },
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value || value < 0) {
                return 'Por favor, insira um número válido!';
            }
        }
    });

    if (!quantidadeCombustao) return;

    const { value: quantidadeEletricos } = await Swal.fire({
        title: 'Quantidade de ônibus elétricos na frota:',
        input: 'number',
        inputAttributes: {
            min: 0
        },
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value || value < 0) {
                return 'Por favor, insira um número válido!';
            }
        }
    });

    if (!quantidadeEletricos) return;

    const { value: eletricosPorAno } = await Swal.fire({
        title: 'Quantos ônibus elétricos são implementados por ano?',
        input: 'number',
        inputAttributes: {
            min: 0
        },
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value || value < 0) {
                return 'Por favor, insira um número válido!';
            }
        }
    });

    if (!eletricosPorAno) return;

    const { value: substituicaoPorAno } = await Swal.fire({
        title: 'Quantos ônibus a combustão são trocados por elétricos por ano?',
        input: 'number',
        inputAttributes: {
            min: 0
        },
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value || value < 0) {
                return 'Por favor, insira um número válido!';
            }
        }
    });

    if (!substituicaoPorAno) return;

    const { value: metaAnual } = await Swal.fire({
        title: 'Qual é a meta anual de emissão de carbono (kg CO2):',
        input: 'number',
        inputAttributes: {
            min: 0
        },
        showCancelButton: true,
        inputValidator: (value) => {
            if (!value || value < 0) {
                return 'Por favor, insira um número válido!';
            }
        }
    });

    if (!metaAnual) return;

    // Convertendo entradas para números
    let combustaoAtual = parseInt(quantidadeCombustao);
    let eletricosAtual = parseInt(quantidadeEletricos);
    const eletricosAno = parseInt(eletricosPorAno);
    const substituicaoAno = parseInt(substituicaoPorAno);
    const meta = parseInt(metaAnual);

    // Calculando a emissão mensal inicial
    let emissaoMensalArray = [];
    let emissaoMensal = calcularEmissaoMensal(combustaoAtual, eletricosAtual);
    emissaoMensalArray.push(emissaoMensal);

    for (let i = 1; i < 12; i++) {
        eletricosAtual += eletricosAno / 12;
        combustaoAtual -= substituicaoAno / 12;
        emissaoMensal = calcularEmissaoMensal(combustaoAtual, eletricosAtual);
        emissaoMensalArray.push(emissaoMensal);
    }

    const emissaoAnual = emissaoMensalArray.reduce((acc, cur) => acc + cur, 0);

    // Verificando se a meta foi alcançada
    if (emissaoAnual <= meta) {
        Swal.fire('Parabéns!', 'A meta anual de emissão de CO2 foi alcançada.', 'success');
    } else {
        Swal.fire('Atenção', 'A meta anual de emissão de CO2 não foi alcançada.', 'error');
    }

    // Criando gráfico com a emissão mensal de CO2
    const ctx = document.getElementById('emissaoAnualChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
                label: 'Emissão Mensal de CO2 (kg)',
                data: emissaoMensalArray,
                backgroundColor: '#36a2eb'
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Se a meta não foi alcançada, calcular em quantos meses/anos será alcançada
    if (emissaoAnual > meta) {
        let totalEmissao = emissaoAnual;
        let meses = 12;
        let previsaoEmissaoArray = [...emissaoMensalArray];
        while (totalEmissao > meta) {
            eletricosAtual += eletricosAno / 12;
            combustaoAtual -= substituicaoAno / 12;
            emissaoMensal = calcularEmissaoMensal(combustaoAtual, eletricosAtual);
            totalEmissao -= emissaoMensal;
            previsaoEmissaoArray.push(emissaoMensal);
            meses++;
        }

        const anos = Math.floor(meses / 12);
        const mesesRestantes = meses % 12;

        Swal.fire({
            title: 'Previsão de Alcance da Meta',
            text: `A meta será alcançada em aproximadamente ${anos} anos e ${mesesRestantes} meses.`,
            icon: 'info'
        });

        // Criando gráfico com a previsão de alcance da meta
        const previsaoCtx = document.getElementById('previsaoChart').getContext('2d');
        new Chart(previsaoCtx, {
            type: 'line',
            data: {
                labels: Array.from({ length: meses }, (_, i) => `Mês ${i + 1}`),
                datasets: [{
                    label: 'Emissão Acumulada de CO2 (kg)',
                    data: previsaoEmissaoArray.reduce((acc, cur, i) => {
                        if (i === 0) acc.push(cur);
                        else acc.push(acc[i - 1] + cur);
                        return acc;
                    }, []),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1,
                    fill: false
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Chamando a função principal ao carregar a página
document.addEventListener('DOMContentLoaded', main);

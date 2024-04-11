// Objeto para armazenar o carrinho de compras
const carrinho = {};

// Função para adicionar um item ao carrinho
function adicionarAoCarrinho(nome, preco, quantidade = 1) {
    if (carrinho[nome]) {
        carrinho[nome].quantidade += quantidade; // Se o item já estiver no carrinho, aumente a quantidade
    } else {
        carrinho[nome] = { preco, quantidade }; // Se o item não estiver no carrinho, adicione-o com quantidade
    }
    
    atualizarCarrinho();
    atualizarContagemCarrinho();
}

// Função para remover um item do carrinho
function removerDoCarrinho(nome, quantidade = 1) {
    if (carrinho[nome]) {
        carrinho[nome].quantidade -= quantidade; // Diminua a quantidade do item no carrinho
        
        if (carrinho[nome].quantidade <= 0) {
            delete carrinho[nome]; // Remova o item do carrinho se a quantidade for menor ou igual a zero
        }
    }
    
    atualizarCarrinho();
    atualizarContagemCarrinho();
}

// Função para finalizar a compra e enviar mensagem para o WhatsApp
function finalizarCompra() {
    // Verifica se há itens no carrinho
    if (Object.keys(carrinho).length === 0) {
        alert("O carrinho está vazio. Adicione itens antes de finalizar a compra.");
        return;
    }

    // Obtém o número do pedido ou define como 1 se não existir
    let numeroPedido = localStorage.getItem("numeroPedido") || 1;

    // Gera os dados do pedido
    const nomeCliente = document.getElementById("nome").value;
    const enderecoCliente = document.getElementById("endereco").value;
    const formaPagamento = document.getElementById("pagamento").value;
    const troco = document.getElementById("troco").value;
    const produtos = Object.entries(carrinho)
        .map(([nome, item]) => {
            return `${item.quantidade}x ${nome} - Valor: R$ ${(
                item.preco * item.quantidade
            ).toFixed(2)}`;
        })
        .join("\n");
    const observacao = document.getElementById("observacao").value;
    const opcaoEntregaSelecionada = document.getElementById("opcaoentrega").value;
    let taxaEntrega = 3;

// Verifica se a opção de entrega é selecionada e obtém a taxa de entrega
if (opcaoEntregaSelecionada === "entrega") {
    taxaEntrega = parseFloat(document.getElementById("valortaxaentrega").textContent.replace("R$ ", "")) || 0;
}


    // Calcula o subtotal do carrinho
    const subtotal = calcularSubtotal();

    // Calcula o total do carrinho
    let total = subtotal;
    if (opcaoEntregaSelecionada === "entrega") {
        total += taxaEntrega;
    }

    // Constrói a mensagem do WhatsApp
    const mensagem = `*Pedido Nº: ${numeroPedido}*\n\n${new Date().toLocaleString("pt-BR")}\n===========================\n\n*Nome:* ${nomeCliente}\n*Endereço:* ${enderecoCliente}\n\n*Produtos:*\n${produtos}\n\n===========================\n*Observação:* ${observacao}\n===========================\n*Subtotal:* R$ ${subtotal.toFixed(2)}\n${opcaoEntregaSelecionada === "entrega" ? `*Taxa de Entrega:* R$ ${taxaEntrega.toFixed(2)}\n` : ""}*Forma de pagamento:* ${formaPagamento}${troco ? " - Troco para: " + troco : ""}\n*Total:* R$ ${total.toFixed(2)}`;

    // Incrementa o número do pedido para o próximo pedido e salva no localStorage
    localStorage.setItem("numeroPedido", parseInt(numeroPedido) + 1);

    // Codifica a mensagem para ser usada na URL
    const mensagemCodificada = encodeURIComponent(mensagem);

    // URL do WhatsApp com o número de telefone e a mensagem
    const urlWhatsApp = `https://api.whatsapp.com/send?phone=5521970129970&text=${mensagemCodificada}`;

    // Abre o WhatsApp em uma nova aba
    window.open(urlWhatsApp, "_blank");

    // Limpa o carrinho após o envio do WhatsApp
    limparCarrinho();

    // Redireciona o usuário para a página inicial após o envio do WhatsApp
    window.location.href = "index.html";
}


// Função para limpar o carrinho
function limparCarrinho() {
    for (const nome in carrinho) {
        delete carrinho[nome];
    }
}

// Função para calcular o subtotal do carrinho
function calcularSubtotal() {
    let subtotal = 0;
    for (const item of Object.values(carrinho)) {
        subtotal += item.preco * item.quantidade;
    }
    return subtotal;
}

// Função para calcular o total do carrinho
function calcularTotal() {
    const subtotal = calcularSubtotal();
    // Adicione o cálculo do valor de entrega ou outras taxas, se necessário
    return subtotal;
}

// Função para atualizar a exibição do carrinho
function atualizarCarrinho() {
    const listaCarrinho = document.querySelector('.lista-carrinho');
    const totalElement = document.getElementById('total');
    listaCarrinho.innerHTML = '';
    let total = 0;

    for (const [nome, item] of Object.entries(carrinho)) {
        const tr = document.createElement('tr');
        const quantidadeTd = document.createElement('td');
        const nomeProdutoTd = document.createElement('td');
        const precoTotalTd = document.createElement('td');
        const botoesTd = document.createElement('td');

        quantidadeTd.textContent = `${item.quantidade}`;
        nomeProdutoTd.textContent = `${nome}`;
        precoTotalTd.textContent = `R$ ${(item.preco * item.quantidade).toFixed(2)}`;

        const botaoAdicionar = criarBotao('+1', () => adicionarAoCarrinho(nome, item.preco, 1));
        const botaoRemover = criarBotao('- 1', () => removerDoCarrinho(nome, 1));

        botoesTd.appendChild(botaoAdicionar);
        botoesTd.appendChild(botaoRemover);

        tr.appendChild(quantidadeTd);
        tr.appendChild(nomeProdutoTd);
        tr.appendChild(precoTotalTd);
        tr.appendChild(botoesTd);

        listaCarrinho.appendChild(tr);
        total += item.preco * item.quantidade;
    }

    totalElement.textContent = `Total: R$ ${total.toFixed(2)}`;
}

// Função auxiliar para criar botões
function criarBotao(texto, onClick) {
    const botao = document.createElement('button');
    botao.textContent = texto;
    botao.classList.add('btn', 'btn-secondary', 'btn-lg', 'mx-1');
    botao.addEventListener('click', onClick);
    return botao;
}

// Função para atualizar a contagem de itens no carrinho
function atualizarContagemCarrinho() {
    const cartCountElement = document.querySelector('.cart-count');
    let totalCount = 0;

    for (const item of Object.values(carrinho)) {
        totalCount += item.quantidade;
    }

    if (totalCount === 0) {
        cartCountElement.textContent = 'vazio';
    } else if (totalCount === 1) {
        cartCountElement.textContent = '1 item';
    } else {
        cartCountElement.textContent = totalCount + ' itens';
    }
}

// Adiciona ouvintes de evento para cada botão "Adicionar ao Carrinho"
document.querySelectorAll('.btn-success').forEach(botao => {
    botao.addEventListener('click', () => {
        const card = botao.closest('.card');
        const nome = card.querySelector('.card-title').textContent;
        const precoTexto = card.querySelector('.card-price').textContent;
        const preco = parseFloat(precoTexto.replace('R$ ', ''));
        adicionarAoCarrinho(nome, preco, 1);
    });
});

// Adiciona ouvinte de evento para o botão "Finalizar Compra"
document.getElementById('finalizar-compra').addEventListener('click', finalizarCompra);

// Adiciona ouvinte de evento para o formulário de checkout
document.getElementById('checkout-form').addEventListener('submit', function (event) {
    event.preventDefault();
    const nome = this.querySelector('#nome').value;
    const endereco = this.querySelector('#endereco').value;
    const formaPagamento = this.querySelector('#formaPagamento').value;

    if (!nome || !endereco || !formaPagamento) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }

    // Processamento do formulário...
    window.location.href = 'index.html'; // Redireciona após o processamento
    this.reset();
});

// Adiciona ouvinte de evento para o campo de seleção de pagamento
document.getElementById('pagamento').addEventListener('change', function () {
    const divTroco = document.getElementById('trocoField');
    divTroco.style.display = this.value === 'Dinheiro' ? 'block' : 'none';
});

// Adiciona ouvinte de evento para o campo de seleção de entrega
document.getElementById('opcaoentrega').addEventListener('change', function () {
    const enderecoLoja = document.getElementById('enderecoloja');
    const taxaEntrega = document.getElementById('taxaentrega');
        
    if (this.value === 'retirada') {
        enderecoLoja.style.display = 'block';
        enderecoLoja.textContent = 'Endereço da Loja: Rua Exemplo, 123 - Bairro - Cidade';
        taxaEntrega.style.display = 'none';
    } else {
        enderecoLoja.style.display = 'none';
        taxaEntrega.style.display = 'block';
    }
});

// Atualiza o campo da taxa de entrega com o valor correto
// document.getElementById('valortaxaentrega').textContent = taxaEntrega.toFixed(2);

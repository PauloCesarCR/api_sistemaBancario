const { depositos } = require('../bancodedados');
const { format } = require('date-fns')
let dados = require('../bancodedados')
let data = new Date();

data = (format(data, "dd/MM/yyyy HH:mm:ss"))


const listarContas = (req, res) => {
    res.status(200).json(dados)
}

const cadastrarConta = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body

    if (!nome) {
        return res.status(400).json({ "mensagem": "O nome é obrigatório" })
    }
    if (!cpf) {
        return res.status(400).json({ "mensagem": "O cpf é obrigatório" })
    }
    if (!data_nascimento) {
        return res.status(400).json({ "mensagem": "A data de Nascimento é obrigatória" })
    }
    if (!telefone) {
        return res.status(400).json({ "mensagem": "O telefone é obrigatório" })
    }
    if (!email) {
        return res.status(400).json({ "mensagem": "O sobrenome é obrigatório" })
    }
    if (!senha) {
        return res.status(400).json({ "mensagem": "A Senha é obrigatória" })
    }
    let jaExiste = false;

    dados.contas.forEach((conta) => {
        if (cpf === conta.cpf || email === conta.email) {
            jaExiste = true;
        }
    })

    if (jaExiste === true) {
        return res.status(400).json({ "mensagem": "Já existe uma conta com o cpf ou e-mail informado!" })
    }

    const conta = {
        numero_conta: 1 + dados.contas.length,
        nome: nome,
        cpf: cpf,
        data_nascimento: data_nascimento,
        telefone: telefone,
        email: email,
        senha: senha,
        saldo: 0
    }

    if (conta) {
        dados.contas.push(conta)
    }
    return res.status(201).send();


}

const atualizarUsuario = (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body
    const { numeroConta } = req.params
    const { contas } = dados

    if (!nome) {
        return res.status(400).json({ "mensagem": "O nome é obrigatório" })
    }
    if (!cpf) {
        return res.status(400).json({ "mensagem": "O cpf é obrigatório" })
    }
    if (!data_nascimento) {
        return res.status(400).json({ "mensagem": "A data de Nascimento é obrigatória" })
    }
    if (!telefone) {
        return res.status(400).json({ "mensagem": "O telefone é obrigatório" })
    }
    if (!email) {
        return res.status(400).json({ "mensagem": "O sobrenome é obrigatório" })
    }
    if (!senha) {
        return res.status(400).json({ "mensagem": "A Senha é obrigatória" })
    }

    const conta = contas.find((conta) => {
        return conta.numero_conta === Number(numeroConta)
    })

    if (!conta) {
        return res.status(404).json({ "mensagem": "Essa conta não existe." })
    }

    if (cpf === conta.cpf) {
        return res.status(400).json({ "mensagem": "O CPF informado já existe cadastrado!" })
    }
    if (email === conta.email) {
        return res.status(400).json({ "mensagem": "O email informado já existe cadastrado!" })
    }
    if (conta) {
        conta.nome = nome
        conta.cpf = cpf
        conta.data_nascimento = data_nascimento
        conta.telefone = telefone
        conta.email = email
        conta.senha = senha
        return res.status(203).json({ "mensagem": "Conta Atualizada" })
    }

}

const excluirConta = (req, res) => {
    const { numeroConta } = req.params

    let contaAserRemovida = dados.contas.find((conta) => {
        return conta.numero_conta === Number(numeroConta);
    })
    if (!contaAserRemovida) {
        return res.status(404).json({ "mensagem": 'Essa conta não existe' })
    }

    if (contaAserRemovida.saldo !== 0) {
        return res.status(403).json({ "mensagem": "A conta só pode ser removida se o saldo for zero!" })
    }
    if (contaAserRemovida) {
        dados.contas = dados.contas.filter((conta) => {
            return conta !== contaAserRemovida
        })
    }
    res.status(204).send()
}

const depositar = (req, res) => {
    const { numero_conta, valor } = req.body

    if (!numero_conta) {
        return res.status(400).json({ "mensagem": "O numero da conta é obrigatório" })
    }
    if (!valor) {
        return res.status(400).json({ "mensagem": "O valor para depósito é obrigatório" })
    }

    if (Number(valor) < 0 || Number(valor) === 0) {
        res.status(403).json({ "mensagem": "Insira um valor maior que 0" })
    }

    let conta = dados.contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta);
    })
    if (!conta) {
        return res.status(404).json({ "mensagem": "Essa conta não existe." })
    }



    if (conta) {
        conta.saldo = conta.saldo + valor;
        const deposito = {
            "data": data,
            "numero_conta": numero_conta,
            "valor": valor
        }
        dados.depositos.push(deposito)
        return res.send()
    }

}

const sacar = (req, res) => {
    const { numero_conta, valor, senha } = req.body

    if (!numero_conta) {
        return res.status(400).json({ "mensagem": "O numero da conta é obrigatório" })
    }
    if (!valor) {
        return res.status(400).json({ "mensagem": "O valor para saque é obrigatório" })
    }
    if (!senha) {
        return res.status(400).json({ "mensagem": "A senha é obrigatória" })
    }
    if (valor <= 0) {
        res.status(400).json({ "mensagem": "O valor precisa ser maior que 0" })
    }


    let conta = dados.contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta);
    })

    if (!conta) {
        return res.status(404).json({ "mensagem": "Essa conta não existe." })
    }

    if (valor > conta.saldo) {
        return res.status(403).json({ "mensagem": "Saldo Insuficiente" })
    }
    if (senha !== Number(conta.senha)) {
        return res.status(400).json({ "mensagem": "Senha Incorreta" })
    }

    if (conta) {
        conta.saldo = conta.saldo - valor;

        const saque = {
            "data": data,
            "numero_conta": numero_conta,
            "valor": valor

        }
        dados.saques.push(saque)
        return res.send();
    }

}

const transferir = (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body


    if (!numero_conta_origem) {
        return res.status(400).json({ "mensagem": "A conta de origem é obrigatória" })
    }
    if (!numero_conta_destino) {
        return res.status(400).json({ "mensagem": "A conta de destino é obrigatória" })
    }
    if (!valor) {
        return res.status(400).json({ "mensagem": "O valor para transferencia é obrigatório" })
    }

    if (!senha) {
        return res.status(400).json({ "mensagem": "A senha é obrigatória" })
    }

    let contaDeOrigem = dados.contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta_origem);
    })

    let contaDestino = dados.contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta_destino);
    })

    if (!contaDeOrigem) {
        return res.status(404).json({ "mensagem": "Conta de Origem não encontrada" })
    }
    if (!contaDestino) {
        return res.status(404).json({ "mensagem": "Conta de Destino não encontrada" })
    }

    if (Number(senha) !== Number(contaDeOrigem.senha)) {
        return res.status(400).json({ "mensagem": "Senha Incorreta" })
    }

    if (contaDeOrigem.saldo <= 0 || valor > contaDeOrigem.saldo) {
        return res.status(401).json({ "mensagem": "Saldo insuficiente!" })
    }


    if (contaDeOrigem && contaDestino) {
        contaDeOrigem.saldo = contaDeOrigem.saldo - valor
        contaDestino.saldo = contaDestino.saldo + valor
        const transferencia = {
            "data": data,
            "numero_conta_origem": numero_conta_origem,
            "numero_conta_destino": numero_conta_destino,
            "valor": valor

        }
        dados.transferencias.push(transferencia)
        return res.status(201).send();
    }

}


const saldo = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta) {
        return res.status(400).json({ "mensagem": "O numero da conta é obrigatório" })
    }
    if (numero_conta > dados.contas.length) {
        return res.status(400).json({ "mensagem": "O numero da conta não existe" })
    }
    if (!senha) {
        return res.status(400).json({ "mensagem": "A senha é obrigatória" })
    }

    let conta = dados.contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta)
    })

    if (Number(conta.senha) !== Number(senha)) {
        return res.status(404).json({ "mensagem": "Senha incorreta" })
    }

    if (conta) {
        res.status(200).json({ "saldo": conta.saldo })
    }

}

const extrato = (req, res) => {
    const { numero_conta, senha } = req.query

    if (!numero_conta) {
        return res.status(400).json({ "mensagem": "O numero da conta é obrigatório" })
    }
    if (numero_conta > dados.contas.length) {
        return res.status(400).json({ "mensagem": "O numero da conta não existe" })
    }
    if (!senha) {
        return res.status(400).json({ "mensagem": "A senha é obrigatória" })
    }

    let conta = dados.contas.find((conta) => {
        return conta.numero_conta === Number(numero_conta)
    })

    if (Number(conta.senha) !== Number(senha)) {
        return res.status(404).json({ "mensagem": "Senha incorreta" })
    }

    let deposito = dados.depositos.find((deposito) => {
        return conta.numero_conta === deposito.numero_conta
    })

    let saque = dados.saques.find((saque) => {
        return conta.numero_conta === saque.numero_conta
    })

    let transferenciasEnviadas = dados.transferencias.find((transferencia) => {
        return conta.numero_conta === Number(transferencia.numero_conta_origem)
    })

    let transferenciasRecebidas = dados.transferencias.find((transferencia) => {
        return conta.numero_conta === Number(transferencia.numero_conta_destino)
    })


    res.status(201).json({ "Depósitos": deposito, "Saques": saque, "Transferências Enviadas": transferenciasEnviadas, "Transferencias Recebidas": transferenciasRecebidas })


}


module.exports = {
    listarContas,
    cadastrarConta,
    atualizarUsuario,
    excluirConta,
    depositar,
    sacar,
    transferir,
    saldo,
    extrato
}
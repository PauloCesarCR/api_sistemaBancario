const express = require('express')
const { listarContas, cadastrarConta, atualizarUsuario, excluirConta, depositar, sacar, transferir, saldo, extrato } = require('../controladores/controlador')
const { validarSenha } = require('../intermediario')
const rotas = express();

rotas.get('/contas', validarSenha, listarContas)
rotas.post('/contas', cadastrarConta)
rotas.put('/contas/:numeroConta/usuario', atualizarUsuario)
rotas.delete('/contas/:numeroConta', excluirConta)

rotas.post('/transacoes/depositar', depositar)
rotas.post('/transacoes/sacar', sacar)
rotas.post('/transacoes/transferir', transferir)
rotas.get('/contas/saldo', saldo)
rotas.get('/contas/extrato', extrato)

module.exports = rotas
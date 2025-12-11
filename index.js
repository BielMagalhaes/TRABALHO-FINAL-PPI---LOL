import express from "express";
import cookieParser from "cookie-parser";
import session from "express-session";

const host = "0.0.0.0";
const porta = 3000;

// LISTAS DO SISTEMA
var listaUsuarios = [];
var listaEquipes = [];
var listaJogadores = [];

const server = express();

// SESSÃO
server.use(session({
    secret:"Minh4Ch4v3S3cr3t4",
    resave: true,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 30 // 30 minutos
    }
}));

server.use(express.urlencoded({extended: true}));
server.use(cookieParser());

// MIDDLEWARE LOGIN
function verificarUsuarioLogado(req, res, next) {
    if (req.session.dadosLogin?.logado === true) {
        next();
    } else {
        res.redirect("/login");
    }
}

// LOGIN - GET
server.get("/login", (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container w-25">
                <form action='/login' method='POST' class="row g-3">
                    <fieldset class="border p-2">
                        <legend class="mb-3">Autenticação do Sistema</legend>
                        <div class="col-md-12">
                            <label class="form-label">Usuário:</label>
                            <input type="text" class="form-control" name="usuario" required>
                        </div>
                        <div class="col-md-12">
                            <label class="form-label">Senha</label>
                            <input type="password" class="form-control" name="senha" required>
                        </div>
                        <div class="col-12 mt-2">
                            <button class="btn btn-primary" type="submit">Login</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </body>
        </html>
    `);
});

// LOGIN - POST
server.post("/login", (req, res) => {
    const {usuario, senha} = req.body;

    if (usuario === "admin" && senha === "admin") {
        req.session.dadosLogin = {
            nome: "Administrador",
            logado: true
        };
        return res.redirect("/");
    }

    res.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
        </head>
        <body>
            <div class="container w-25">
                <form action='/login' method='POST' class="row g-3">
                    <fieldset class="border p-2">
                        <legend class="mb-3">Autenticação do Sistema</legend>

                        <div class="col-md-12">
                            <label class="form-label">Usuário:</label>
                            <input type="text" class="form-control" name="usuario">
                        </div>
                        <div class="col-md-12">
                            <label class="form-label">Senha</label>
                            <input type="password" class="form-control" name="senha">
                        </div>
                        
                        <p class="text-danger mt-2">Usuário ou senha inválidos</p>

                        <div class="col-12 mt-2">
                            <button class="btn btn-primary" type="submit">Login</button>
                        </div>
                    </fieldset>
                </form>
            </div>
        </body>
        </html>
    `);
});

// LOGOUT
server.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
});
// MENU PRINCIPAL
server.get("/", verificarUsuarioLogado, (req, res) => {
    let ultimoAcesso = req.cookies?.ultimoAcesso;

    const data = new Date();
    res.cookie("ultimoAcesso", data.toLocaleString());

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Menu do Sistema</title>
        </head>
        <body>

            <nav class="navbar navbar-expand-lg navbar-light bg-light">
                <div class="container-fluid">
                    
                    <a class="navbar-brand d-flex align-items-center" href="/">
                         <img src="https://upload.wikimedia.org/wikipedia/commons/7/7f/League_of_Legends_logo.png"
                            width="40" class="me-2">
                         MENU
                    </a>



                    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                        <span class="navbar-toggler-icon"></span>
                    </button>

                    <div class="collapse navbar-collapse" id="navbarNav">

                        <ul class="navbar-nav me-auto mb-2 mb-lg-0">

                            <li class="nav-item">
                                <a class="nav-link active" href="/">Home</a>
                            </li>

                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                                    Cadastros
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="/cadastroUsuario">Usuários</a></li>
                                    <li><a class="dropdown-item" href="/cadastroEquipe">Equipes</a></li>
                                    <li><a class="dropdown-item" href="/cadastroJogador">Jogadores</a></li>
                                </ul>
                            </li>

                            <li class="nav-item">
                                <a class="nav-link" href="/logout">Sair</a>
                            </li>

                        </ul>

                    </div>

                </div>
            </nav>

            <div class="container mt-4">
                <h3>Bem-vindo ao sistema!</h3>
                <p>Último acesso: ${ultimoAcesso || "Primeiro acesso"}</p>
            </div>

            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"></script>
        </body>
        </html>
    `);
});


// -----------------------------
// CADASTRO DE USUÁRIOS (CÓDIGO ORIGINAL)
// -----------------------------

server.get("/cadastroUsuario", verificarUsuarioLogado,(req,res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
            <head>
                <meta charset="UTF-8">
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
                <title>Cadastro de Usuários</title>
            </head>
            <body>
                <div class="container">
                    <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Usuários</h1>

                    <form method="POST" action="/adicionarUsuario" class="row g-3 m-3 p-3 bg-light">

                        <div class="col-md-4">
                            <label for="nome" class="form-label">Nome</label>
                            <input type="text" class="form-control" id="nome" name="nome">
                        </div>

                        <div class="col-md-4">
                            <label for="sobrenome" class="form-label">Sobrenome</label>
                            <input type="text" class="form-control" id="sobrenome" name="sobrenome">
                        </div>

                        <div class="col-md-4">
                            <label for="usuario" class="form-label">Usuário</label>
                            <div class="input-group has-validation">
                                <span class="input-group-text">@</span>
                                <input type="text" class="form-control" id="usuario" name="usuario">
                            </div>
                        </div>

                        <div class="col-md-6">
                            <label class="form-label">Cidade</label>
                            <input type="text" class="form-control" name="cidade">
                        </div>

                        <div class="col-md-3">
                            <label class="form-label">UF</label>
                            <select class="form-select" name="uf">
                                <option selected disabled value="">Escolha...</option>
                                <option value="SP">SP</option>
                                <option value="RJ">RJ</option>
                                <option value="MG">MG</option>
                                <option value="BA">BA</option>
                            </select>
                        </div>

                        <div class="col-md-3">
                            <label class="form-label">CEP</label>
                            <input type="text" class="form-control" name="cep">
                        </div>

                        <div class="col-12">
                            <button class="btn btn-primary" type="submit">Cadastrar</button>
                            <a class="btn btn-secondary" href="/">Voltar</a>
                        </div>

                    </form>
                </div>
            </body>
        </html>
    `);
});

// ADICIONAR USUÁRIO
server.post('/adicionarUsuario', verificarUsuarioLogado, (req, res) => {
    const {nome, sobrenome, usuario, cidade, uf, cep} = req.body;

    if (nome && sobrenome && usuario && cidade && uf && cep){
        listaUsuarios.push({nome, sobrenome, usuario, cidade, uf, cep});
        return res.redirect("/listarUsuarios");
    }

    // se faltar campo, exibe erros exatamente como no seu modelo
    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Cadastro de Usuários</title>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Usuários</h1>

                <form method="POST" action="/adicionarUsuario" class="row g-3 m-3 p-3 bg-light">

                    <div class="col-md-4">
                        <label class="form-label">Nome</label>
                        <input type="text" class="form-control" name="nome" value="${nome}">
    `;
    if (!nome) conteudo += `<p class="text-danger">Informe o nome</p>`;
    conteudo += `
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Sobrenome</label>
                        <input type="text" class="form-control" name="sobrenome" value="${sobrenome}">
    `;
    if (!sobrenome) conteudo += `<p class="text-danger">Informe o sobrenome</p>`;
    conteudo += `
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Usuário</label>
                        <input type="text" class="form-control" name="usuario" value="${usuario}">
    `;
    if (!usuario) conteudo += `<p class="text-danger">Informe o usuário</p>`;
    conteudo += `
                    </div>

                    <div class="col-md-6">
                        <label class="form-label">Cidade</label>
                        <input type="text" class="form-control" name="cidade" value="${cidade}">
    `;
    if (!cidade) conteudo += `<p class="text-danger">Informe a cidade</p>`;
    conteudo += `
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">UF</label>
                        <select class="form-select" name="uf">
                            <option value="">Escolha...</option>
                            <option value="SP" ${uf==="SP"?"selected":""}>SP</option>
                            <option value="RJ" ${uf==="RJ"?"selected":""}>RJ</option>
                            <option value="MG" ${uf==="MG"?"selected":""}>MG</option>
                            <option value="BA" ${uf==="BA"?"selected":""}>BA</option>
                        </select>
    `;
    if (!uf) conteudo += `<p class="text-danger">Informe o UF</p>`;
    conteudo += `
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">CEP</label>
                        <input type="text" class="form-control" name="cep" value="${cep}">
    `;
    if (!cep) conteudo += `<p class="text-danger">Informe o CEP</p>`;
    conteudo += `
                    </div>

                    <div class="col-12">
                        <button class="btn btn-primary" type="submit">Cadastrar</button>
                        <a class="btn btn-secondary" href="/">Voltar</a>
                    </div>

                </form>
            </div>
        </body>
        </html>
    `;

    res.send(conteudo);
});

// LISTAR USUÁRIOS
server.get("/listarUsuarios", verificarUsuarioLogado,(req, res) => {
    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Lista de Usuários</title>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center border m-3 p-3 bg-light">Lista de Usuários</h1>
                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Sobrenome</th>
                            <th>Usuário</th>
                            <th>Cidade</th>
                            <th>UF</th>
                            <th>CEP</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    for (let u of listaUsuarios) {
        conteudo += `
            <tr>
                <td>${u.nome}</td>
                <td>${u.sobrenome}</td>
                <td>${u.usuario}</td>
                <td>${u.cidade}</td>
                <td>${u.uf}</td>
                <td>${u.cep}</td>
            </tr>
        `;
    }

    conteudo += `
                    </tbody>
                </table>
                <a class="btn btn-secondary" href="/cadastroUsuario">Voltar</a>
            </div>
        </body>
        </html>
    `;

    res.send(conteudo);
});
// -------------------------------------------
// CADASTRO DE EQUIPES - GET
// -------------------------------------------
server.get("/cadastroEquipe", verificarUsuarioLogado, (req, res) => {
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Cadastro de Equipes</title>
        </head>
        <body>
            <div class="container">
                <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Equipes</h1>

                <form method="POST" action="/adicionarEquipe" class="row g-3 m-3 p-3 bg-light">

                    <div class="col-md-4">
                        <label class="form-label">Nome da Equipe</label>
                        <input type="text" class="form-control" name="nomeEquipe">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Capitão</label>
                        <input type="text" class="form-control" name="capitao">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Telefone/WhatsApp</label>
                        <input type="text" class="form-control" name="telefone">
                    </div>

                    <div class="col-12">
                        <button class="btn btn-primary" type="submit">Cadastrar</button>
                        <a class="btn btn-secondary" href="/">Voltar</a>
                    </div>

                </form>
            </div>
        </body>
        </html>
    `);
});
// -------------------------------------------
// CADASTRO DE EQUIPES - POST
// -------------------------------------------
server.post("/adicionarEquipe", verificarUsuarioLogado, (req, res) => {
    const { nomeEquipe, capitao, telefone } = req.body;

    if (nomeEquipe && capitao && telefone) {
        listaEquipes.push({ nomeEquipe, capitao, telefone });
        return res.redirect("/listarEquipes");
    }

    // SE ALGUM CAMPO ESTIVER FALTANDO
    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Cadastro de Equipes</title>
        </head>
        <body>

            <div class="container">
                <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Equipes</h1>

                <form method="POST" action="/adicionarEquipe" class="row g-3 m-3 p-3 bg-light">

                    <div class="col-md-4">
                        <label class="form-label">Nome da Equipe</label>
                        <input type="text" class="form-control" name="nomeEquipe" value="${nomeEquipe || ""}">
    `;
    if (!nomeEquipe) conteudo += `<p class="text-danger">Informe o nome da equipe</p>`;
    conteudo += `
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Capitão</label>
                        <input type="text" class="form-control" name="capitao" value="${capitao || ""}">
    `;
    if (!capitao) conteudo += `<p class="text-danger">Informe o capitão</p>`;
    conteudo += `
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Telefone/WhatsApp</label>
                        <input type="text" class="form-control" name="telefone" value="${telefone || ""}">
    `;
    if (!telefone) conteudo += `<p class="text-danger">Informe o telefone</p>`;
    conteudo += `
                    </div>

                    <div class="col-12">
                        <button class="btn btn-primary" type="submit">Cadastrar</button>
                        <a class="btn btn-secondary" href="/">Voltar</a>
                    </div>

                </form>
            </div>

        </body>
        </html>
    `;

    res.send(conteudo);
});
// -------------------------------------------
// LISTAR EQUIPES
// -------------------------------------------
server.get("/listarEquipes", verificarUsuarioLogado, (req, res) => {
    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Lista de Equipes</title>
        </head>
        <body>

            <div class="container">
                <h1 class="text-center border m-3 p-3 bg-light">Lista de Equipes</h1>

                <table class="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th>Nome da Equipe</th>
                            <th>Capitão</th>
                            <th>Telefone</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    for (let i = 0; i < listaEquipes.length; i++) {
        conteudo += `
            <tr>
                <td>${listaEquipes[i].nomeEquipe}</td>
                <td>${listaEquipes[i].capitao}</td>
                <td>${listaEquipes[i].telefone}</td>
            </tr>
        `;
    }

    conteudo += `
                    </tbody>
                </table>

                <a class="btn btn-secondary" href="/cadastroEquipe">Voltar</a>
            </div>

        </body>
        </html>
    `;

    res.send(conteudo);
});
// -------------------------------------------
// CADASTRO DE JOGADORES - GET
// -------------------------------------------
server.get("/cadastroJogador", verificarUsuarioLogado, (req, res) => {

    // Monta opções do <select> com equipes cadastradas
    let opcoesEquipe = "";
    for (let i = 0; i < listaEquipes.length; i++) {
        opcoesEquipe += `<option value="${listaEquipes[i].nomeEquipe}">${listaEquipes[i].nomeEquipe}</option>`;
    }

    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Cadastro de Jogadores</title>
        </head>
        <body>

            <div class="container">
                <h1 class="text-center border m-3 p-3 bg-light">Cadastro de Jogadores</h1>

                <form method="POST" action="/adicionarJogador" class="row g-3 m-3 p-3 bg-light">

                    <div class="col-md-4">
                        <label class="form-label">Nome do Jogador</label>
                        <input type="text" class="form-control" name="nome">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Nickname (in-game)</label>
                        <input type="text" class="form-control" name="nick">
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Função</label>
                        <select class="form-select" name="funcao">
                            <option selected disabled value="">Selecione...</option>
                            <option value="top">Top</option>
                            <option value="jungle">Jungle</option>
                            <option value="mid">Mid</option>
                            <option value="atirador">Atirador</option>
                            <option value="suporte">Suporte</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Elo</label>
                        <select class="form-select" name="elo">
                            <option selected disabled value="">Selecione...</option>
                            <option value="Ferro">Ferro</option>
                            <option value="Bronze">Bronze</option>
                            <option value="Prata">Prata</option>
                            <option value="Ouro">Ouro</option>
                            <option value="Platina">Platina</option>
                            <option value="Diamante">Diamante</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Gênero</label>
                        <select class="form-select" name="genero">
                            <option selected disabled value="">Selecione...</option>
                            <option value="Masculino">Masculino</option>
                            <option value="Feminino">Feminino</option>
                            <option value="Outro">Outro</option>
                        </select>
                    </div>

                    <div class="col-md-4">
                        <label class="form-label">Equipe</label>
                        <select class="form-select" name="equipe">
                            <option selected disabled value="">Selecione...</option>
                            ${opcoesEquipe}
                        </select>
                    </div>

                    <div class="col-12">
                        <button class="btn btn-primary" type="submit">Cadastrar</button>
                        <a class="btn btn-secondary" href="/">Voltar</a>
                    </div>

                </form>

            </div>

        </body>
        </html>
    `);
});
// -------------------------------------------
// CADASTRO DE JOGADORES - POST
// -------------------------------------------
server.post("/adicionarJogador", verificarUsuarioLogado, (req, res) => {
    const { nome, nick, funcao, elo, genero, equipe } = req.body;

    if (nome && nick && funcao && elo && genero && equipe) {
        listaJogadores.push({ nome, nick, funcao, elo, genero, equipe });
        return res.redirect("/listarJogadores");
    }

    // SIMPLES (igual ao professor faz): erro genérico
    res.send(`
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Erro no Cadastro</title>
        </head>
        <body class="container mt-5">
            <h3 class="text-danger">Preencha todos os campos corretamente.</h3>
            <a class="btn btn-secondary mt-3" href="/cadastroJogador">Voltar</a>
        </body>
        </html>
    `);
});
// -------------------------------------------
// LISTAR JOGADORES AGRUPADOS POR EQUIPE
// -------------------------------------------
server.get("/listarJogadores", verificarUsuarioLogado, (req, res) => {

    let conteudo = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet">
            <title>Jogadores por Equipe</title>
        </head>
        <body>

            <div class="container">
                <h1 class="text-center border m-3 p-3 bg-light">Jogadores Cadastrados</h1>
    `;

    // Percorre todas as equipes cadastradas
    for (let i = 0; i < listaEquipes.length; i++) {

        const equipe = listaEquipes[i].nomeEquipe;

        conteudo += `
            <h3 class="mt-4">${equipe}</h3>
            <ul class="list-group mb-4">
        `;

        // Lista os jogadores da equipe atual
        let temJogadores = false;

        for (let j = 0; j < listaJogadores.length; j++) {
            if (listaJogadores[j].equipe === equipe) {
                temJogadores = true;
                conteudo += `
                    <li class="list-group-item">
                        <strong>${listaJogadores[j].nome}</strong> (${listaJogadores[j].nick})  
                        - Função: ${listaJogadores[j].funcao}  
                        - Elo: ${listaJogadores[j].elo}  
                        - Gênero: ${listaJogadores[j].genero}
                    </li>
                `;
            }
        }

        if (!temJogadores) {
            conteudo += `
                <li class="list-group-item text-muted">
                    Nenhum jogador cadastrado nesta equipe.
                </li>
            `;
        }

        conteudo += `</ul>`;
    }

    conteudo += `
                <a class="btn btn-secondary" href="/cadastroJogador">Voltar</a>
            </div>

        </body>
        </html>
    `;

    res.send(conteudo);
});
// -------------------------------------------
// INICIAR SERVIDOR
// -------------------------------------------
server.listen(porta, host, () => {
    console.log(`Servidor rodando em http://${host}:${porta}`);
});

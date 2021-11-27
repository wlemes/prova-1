const express = require('express');
const app = express();
const sqlite3 = require('sqlite3').verbose();
const port = process.env.port || 3000;
const path = require('path');
const bodyParser = require('body-parser');

const alert = require('alert');

app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set('view engine', 'ejs');
app.set('views', './views');

const db = new sqlite3.Database('db.db', err => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Connected to the in-memory SQlite database.');
});

const sql_create = `CREATE TABLE IF NOT EXISTS Pesquisa (
    partnome varchar(10) primary key,
    idade integer,
    sexo varchar(1) not null,
    renda real,
    voto varchar(1) not null);`;

const sql_insert = `INSERT INTO Pesquisa (partnome, idade, sexo, renda, voto) VALUES ('Carlos', 30, 'M', 3500, 'S')`;

db.run(sql_create, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Table created.');
});

db.run(sql_insert, err => {
    if (err) {
        return console.error(err.message);
    }
    console.log('Data inserted.');
});

app.get("/", (req, res) => {
    res.render('registrar');
});

app.post('/pesquisa', (req, res) => {
    const sql = `INSERT INTO Pesquisa (partnome, idade, sexo, renda, voto) VALUES (?, ?, ?, ?, ?)`;
    const creation = [req.body.partnome, req.body.idade, req.body.sexo, req.body.renda, req.body.voto];
    db.run(sql, creation, err => {
        if (err) {
            return console.error(err.message);
        }
    });
    alert('Data inserida.');
    res.redirect('/');
});

app.get('/faixaetaria', (req, res) => {
    const { idade_inicial, idade_final } = req.query;
    const sqlnum = `SELECT COUNT(*) FROM Pesquisa WHERE idade BETWEEN ${idade_inicial} AND ${idade_final}`;
    let num;
    var valida;
    db.get(sqlnum, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        num = row['COUNT(*)'];
    });
    const sql = `SELECT COUNT(*) FROM Pesquisa WHERE idade BETWEEN ${idade_inicial} AND ${idade_final} AND voto = 'S'`;
    const sqln = `SELECT COUNT(*) FROM Pesquisa WHERE idade BETWEEN ${idade_inicial} AND ${idade_final} AND voto = 'N'`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        rows = rows[0]['COUNT(*)'];
        if (rows == 0) {
            valida = false;
        }
        rowspercent = (rows / num) * 100;
        db.all(sqln, (err, rowsn) => {
            if (err) {
                return console.error(err.message);
            }
            rowsn = rowsn[0]['COUNT(*)'];
            if (rowsn == 0 && valida == false) {
                alert('Não há dados para a faixa etária informada.');
                res.redirect('/');
            } else {
                rowsnpercent = (rowsn / num) * 100;
                //res.send({ rowsnpercent, rowspercent });
                alert('Faixa etária: ' + idade_inicial + ' a ' + idade_final + '\n' + 'Número de pessoas: ' + num + '\n' + 'Número de votos S: ' + rows + ' (' + rowspercent + '%)\n' + 'Número de votos N: ' + rowsn + ' (' + rowsnpercent + '%)');
                res.redirect('/');
            }
        });
    });
});

app.get('/sexo', (req, res) => {
    const { sexo } = req.query;
    const sqlnum = `SELECT COUNT(*) FROM Pesquisa WHERE sexo = '${sexo}'`;
    let num;
    var valida = true;
    db.get(sqlnum, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        num = row['COUNT(*)'];
    });
    const sql = `SELECT COUNT(*) FROM Pesquisa WHERE sexo = '${sexo}' AND voto = 'S'`;
    const sqlf = `SELECT COUNT(*) FROM Pesquisa WHERE sexo = '${sexo}' AND voto = 'N'`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        rows = rows[0]['COUNT(*)'];
        console.log(rows);
        if (rows == 0) {
            valida = false;
        }
        rowspercent = (rows / num) * 100;
        db.all(sqlf, (err, rowsf) => {
            if (err) {
                return console.error(err.message);
            }
            rowsf = rowsf[0]['COUNT(*)'];
            if (rowsf == 0 && valida == false) {
                alert('Não há votos nem contra nem a favor nesse sexo');
                res.redirect('/');

            }
            else {
                rowspercentf = (rowsf / num) * 100;
                // res.status(200).send({ rowspercent, rowspercentf });
                alert(rowspercent + '% de votos do sexo ' + sexo + ' são sim e ' + rowspercentf + '% de votos do sexo ' + sexo + ' são não.');
                res.redirect('/');
                console.log(rowspercent);
            }
        });
    });
});

app.get('/renda', (req, res) => {
    const { renda_inicial, renda_final } = req.query;
    const sqlnum = `SELECT COUNT(*) FROM Pesquisa WHERE renda BETWEEN ${renda_inicial} AND ${renda_final}`;
    let num, rowspercent, rowspercentn, verifica;
    var votos, voton;
    db.get(sqlnum, (err, row) => {
        if (err) {
            return console.error(err.message);
        }
        num = row['COUNT(*)'];
    });
    const sql = `SELECT COUNT(*) FROM Pesquisa WHERE renda BETWEEN ${renda_inicial} AND ${renda_final} AND voto = 'S'`;
    const sqln = `SELECT COUNT(*) FROM Pesquisa WHERE renda BETWEEN ${renda_inicial} AND ${renda_final} AND voto = 'N'`;
    db.all(sql, (err, rows) => {
        if (err) {
            return console.error(err.message);
        }
        votos = rows[0]['COUNT(*)'];
        if (votos == 0) {
            verifica = false;
        }
        rowspercent = (votos / num) * 100;
        console.log(rowspercent);
        db.all(sqln, (err, rows) => {
            if (err) {
                return console.error(err.message);
            }
            voton = rows[0]['COUNT(*)'];
            if (voton == 0 && verifica == false) {
                alert('Não há votos nem contra nem a favor nessa faixa de renda');
                res.redirect('/');
            } else {
                rowspercentn = (voton / num) * 100;
                console.log(rowspercentn);
                //res.send({ rowspercentn, rowspercent });
                alert(rowspercent + '% de votos são sim e ' + rowspercentn + '% de votos são não.');
                res.redirect('/');
            }
        });
    });
});


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
var fs  = require('fs')
var mysql = require('mysql')

function begin(voiceBuffer)
{   
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "rt3xp@n0",
        multipleStaments: true,
        database: "AnastasiaDB"
    });

    con.connect(function(err) {
        if (err)
        {
            throw err;
        } 

        var idAj = 0;
        var idAju = 0;
        var idAjp = 0;
        var past    = "";
        var patrons = [];

        con.query("SELECT * FROM anastasiadb_DBV", function (err, result) {
            if (err) throw err;

            for (var i = 0; i < result.length; i++)
            {
                var str  = past + " " + result[i].tipo;
                var strI = result[i].tipo + " " + past;

                if (str != strI)
                {
                    var encontrado = false;
                    for (var j = 0; j < patrons.length; j++)
                    {
                        if (patrons[j].name == str ||
                            patrons[j].name == strI)
                        {
                            encontrado = true;
                            patrons[j].count++;
                        }
                    }

                    if (!encontrado)
                    {
                        patrons.push({name: str, count: 1});
                    }
                }

                if (result[i].tipo == "ART" || 
                    result[i].tipo == "STA" || 
                    result[i].tipo == "VQM" )
                {
                    idAj++;
                    console.log(idAj);

                    var sql = "UPDATE anastasiadb_AJ SET id = ? WHERE id IS NULL LIMIT 1";
                    con.query(sql, idAj, function (err, result) {
                        if (err) throw "anastasiadb_AJ\n" + sql + "\n" + idAj + "\n" + err;
                    });
                }
                else if (result[i].tipo == "ARTp" || 
                         result[i].tipo == "STAp" || 
                         result[i].tipo == "VQMp" )
                {
                    idAjp++;

                    var sql = "UPDATE anastasiadb_AJp SET id = ?, idparent = ? WHERE id IS NULL LIMIT 1";
                    con.query(sql, [idAjp, idAju], function (err, result) {
                        if (err) throw "anastasiadb_AJp\n" + sql + "\n" + [idAjp, idAju] + "\n" + err;
                    });
                }
                else if (result[i].tipo == "ARTu" || 
                         result[i].tipo == "STAu" || 
                         result[i].tipo == "VQMu" )
                {
                    idAju++;

                    var sql = "UPDATE anastasiadb_AJu SET id = ?, idparent = ? WHERE id IS NULL LIMIT 1";
                    con.query(sql, [idAju, idAj], function (err, result) {
                        if (err) throw "anastasiadb_AJu\n" + sql + "\n" + [idAju, idAj] + "\n" + err;
                    });
                }

                past = result[i].tipo;
            }

            console.log(patrons);    

        });

        
    });    
}

begin();
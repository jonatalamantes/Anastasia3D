var fs  = require('fs')
var mysql = require('mysql')
voiceBuffer2 = null

function validateVoiceBank(voiceBuffer)
{   
    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "3daysgrace",
        multipleStaments: true,
        database: "AnastasiaDB"
    });

    voiceBuffer2 = voiceBuffer

    con.connect(function(err) {
        if (err)
        {
            throw err;
        } 

        fonemas   = [];
        clases    = [];
        infClases = [];
        key       = "";

        data = voiceBuffer;

        //Desechamos los primeros ocho bytes
        data = data.slice(8);

        //Revisamos que diga DBSe el siguiente tramo
        if (data.slice(0,4).equals(new Buffer("DBSe")))
        {
            console.log("Procesando DBSe");
            data = data.slice(8);
        }
        else
        {
            return -1;
        }

        if (data.readUInt8(0) == 1)
        {
            data = data.slice(12);
        }
        else
        {
            return -2
        }

        console.log(data.slice(0,4))
        console.log(new Buffer("PHDCJ"))

        if (data.slice(0,4).equals(new Buffer("PHDC")))
        {
            console.log("Procesando PHDC");
            data = data.slice(12);
        }
        else
        {
            return -45
        }

        tam = data.readUInt8(0);
        data = data.slice(3);

        for (var i = 0;  i < tam; i++)
        {
            text = cleanString(data.slice(0,31).toString());
            data = data.slice(31);
            fonemas.push(text);
        }

        console.log(tam)

        //Process the next part
        if (data.readUInt8(0) == 1)
        {
            data = data.slice(1);
        }   
        else
        {
            return -3;
        }

        if (data.slice(0,4).equals(new Buffer("PHG2")))
        {
            console.log("Procesando PHG2");
            data = data.slice(8);
        }

        tamClases = data.readUInt8(0);
        data = data.slice(4);

        for (var i = 0; i < tamClases; i++)
        {
            classLen = data.readUInt8(0);
            data = data.slice(4);

            className = cleanString(data.slice(0,classLen).toString());
            data = data.slice(classLen);

            instances = data.readUInt8(0);
            data = data.slice(4);

            for (var j = 0; j < instances; j++)
            {
                id   = data.readUInt8(0);
                data = data.slice(4);

                cantidad = data.readUInt8(0);
                data = data.slice(4);

                text = data.slice(0, cantidad).toString();
                data = data.slice(cantidad);

                clases.push({id: id, class: className, val: text});
            }

            data = data.slice(4);
        }

        len1 = data.readUInt8(0);
        data = data.slice(4);    

        len2 = data.readUInt8(0);

        for (k = 0; k < len1; k++)
        {
        	var char1 = cleanString(data.slice(0, 32).toString('utf-8'));
        	var begin = data.readUInt8(32);
    		var inf = data.slice(48, 100); //len2

    		infClases.push({"fonema": char1, "tipo": begin, "info": inf});
        	data = data.slice(100);
        }

        //Read the Long Key
        key = cleanString(data.slice(0, 32).toString('utf-8'));
        data = data.slice(32);
        data = data.slice(228);

        var1 = data.readUInt8(0);
        data = data.slice(12);

        //Read the DBVI
        if (data.slice(0,4).equals(new Buffer("DBV ")))
        {
            console.log("Procesando DBV ");
            data = data.slice(8);
        }
        else
        {
            return -1;
        }

        var2 = data.readUInt8(0);
        data = data.slice(8);

        var3 = data.readUInt8(0);
        data = data.slice(12);

        console.log("DBV" + " " + var1 + " " + var2 + " " + var3);

        con.query("TRUNCATE TABLE anastasiadb_ARR", function (err, result) {
            if (err) throw err;
            console.log("Truncada ARR")
        });

        con.query("TRUNCATE TABLE anastasiadb_DBV", function (err, result) {
            if (err) throw err;
            console.log("Truncada DBV")
        });

        con.query("TRUNCATE TABLE anastasiadb_ART", function (err, result) {
            if (err) throw err;
            console.log("Truncada ART")
        });

        con.query("TRUNCATE TABLE anastasiadb_ARTu", function (err, result) {
            if (err) throw err;
            console.log("Truncada ARTu")
        });

        con.query("TRUNCATE TABLE anastasiadb_EpR", function (err, result) {
            if (err) throw err;
            console.log("Truncada EpR")
        });

        con.query("TRUNCATE TABLE anastasiadb_ARTp", function (err, result) {
            if (err) throw err;
            console.log("Truncada ARTp")
        });

        con.query("TRUNCATE TABLE anastasiadb_STA", function (err, result) {
            if (err) throw err;
            console.log("Truncada STA")
        });

        con.query("TRUNCATE TABLE anastasiadb_STAu", function (err, result) {
            if (err) throw err;
            console.log("Truncada STAu")
        });

        con.query("TRUNCATE TABLE anastasiadb_STAp", function (err, result) {
            if (err) throw err;
            console.log("Truncada STAp")
        });

        con.query("TRUNCATE TABLE anastasiadb_VQM", function (err, result) {
            if (err) throw err;
            console.log("Truncada VQM")
        });

        con.query("TRUNCATE TABLE anastasiadb_VQMu", function (err, result) {
            if (err) throw err;
            console.log("Truncada VQMu")
        });

        con.query("TRUNCATE TABLE anastasiadb_VQMp", function (err, result) {
            if (err) throw err;
            console.log("Truncada VQMp")
        });

        con.query("TRUNCATE TABLE anastasiadb_TDB", function (err, result) {
            if (err) throw err;
            console.log("Truncada TDB")
        });

        con.query("TRUNCATE TABLE anastasiadb_TMM", function (err, result) {
            if (err) throw err;
            console.log("Truncada TMM")
        });

        //Exploramos la primera parte que es la ARR
        continua = true;
        arrC   = 0;
        artC   = 0;
        artuC  = 0;
        artpC  = 0;
        staC   = 0;
        stauC  = 0;
        stapC  = 0;
        vqmC   = 0;
        vqmuC  = 0;
        vqmpC  = 0;
        tdbC   = 0;
        tmmC   = 0;

        actualARR  = null;
        actualART  = null;
        actualARTu = null;
        actualARTp = null;
        actualSTA  = null;
        actualSTAu = null;
        actualSTAp = null;
        actualVQM  = null;
        actualVQMu = null;
        actualVQMp = null;
        actualTDB  = null;
        actualTMM  = null;

        tokens = ["ARR ", "ARTu", "ARTp", "STA ", "ART ", "STAp", "STAu", "VQM ", "VQMu", "VQMp", "TMM ", "TDB "]

        console.log("EpR: "  + voiceBuffer.toString().split("EpR").length-1)
    	console.log("ARR: "  + voiceBuffer.toString().split("ARR").length-1)
    	console.log("ARTu: " + voiceBuffer.toString().split("ARTu").length-1)
    	console.log("ARTp: " + voiceBuffer.toString().split("ARTp").length-1)
    	console.log("ART: "  + voiceBuffer.toString().split("ART ").length-1)
    	console.log("STA : " + voiceBuffer.toString().split("STA ").length-1)
    	console.log("STAu: " + voiceBuffer.toString().split("STAu").length-1)
    	console.log("STAp: " + voiceBuffer.toString().split("STAp").length-1)
    	console.log("VQM: "  + voiceBuffer.toString().split("VQM").length-1)
    	console.log("VQMu: " + voiceBuffer.toString().split("VQMu").length-1)
    	console.log("TMM: "  + voiceBuffer.toString().split("TMM").length-1)
    	console.log("TDB: "  + voiceBuffer.toString().split("TDB").length-1)

        intentos = 0
        while (continua)
        {
        	que = whois(data);

            dataTemp = data.slice(4)
            stop = false
            posNueva = 4
            next = ""

            while (!stop && dataTemp.length != 0)
            {
                next = dataTemp.slice(0,4).toString('utf-8')

                for (var t = 0; t < tokens.length; t++)
                {
                    if (tokens[t] == next)
                    {
                        stop = true
                    }
                }

                dataTemp = dataTemp.slice(1)
                posNueva++
            }

            console.log((voiceBuffer.length - data.length).toString(16))

            dataTemp = data.slice(0, posNueva+50)
            data = data.slice(posNueva-1)

    	    if (que == "ARR")
    	    {
    	    	arrC++;
    	    	dataTemp = readARR(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "ARR", arrC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_ARR (id, v1, v2, v3, v4, v5) VALUES (?, ?, ?, ?, ?, ?)";
                con.query(sql, [arrC, actualARR.v1, actualARR.v2, actualARR.v3, actualARR.v4, actualARR.v5], function (err, result) {
                    if (err) throw "ARR\n" + sql + "\n" + err;
                });

    	    }
    	    else if (que == "ARTu")
    	    {
                artuC++;
                dataTemp = readARTu(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "ARTu", artuC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_ARTu (id, idParent, v1, v2, v3, v4) VALUES (?, ?, ?, ?, ?, ?)";
                con.query(sql, [artuC, actualARTu.idParent, actualARTu.v1, actualARTu.v2, actualARTu.v3, actualARTu.v4], function (err, result) {
                    if (err) throw "ARTu\n" + sql + "\n" + err;
                });
    	    }
    	    else if (que == "ARTp")
    	    {
    	    	artpC++;
    	    	dataTemp = readARTp(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "ARTp", artpC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                var queryParams = [];
                var queryParams2 = [];
                var sql1 = "INSERT INTO anastasiadb_ARTp (id, ";
                var sql2 = "INSERT INTO anastasiadb_EpR (id, ";
                var sql3 = " VALUES (" + artpC + ", ";
                var sql4 = " VALUES (" + (stapC + artpC + vqmpC) + ", ";

                for (var x = 0; x < actualARTp.length-1; x++)
                {
                    if (x == 14) //EpR
                    {
                        queryParams2.push(actualARTp[x]);

                        temp = "";
                        for (y = 0; y < actualARTp[x+1].length; y++)
                        {
                            temp += actualARTp[x+1][y].toString("hex");
                        }

                        queryParams2.push(temp);
                        x++;

                        sql2 += "len, data, ";
                        sql4 += "?, ?, ";

                        queryParams.push(stapC + artpC + vqmpC);
                        sql1 += "v" + (x+1) + ", ";
                        sql3 += "?, ";              
                    }
                    else
                    {
                        queryParams.push(actualARTp[x]);
                        
                        sql1 += "v" + (x+1) + ", ";
                        sql3 += "?, ";                        
                    }
                }

                sql1 += "idParent, ";
                sql3 += "?, ";        
                queryParams.push(actualARTp[actualARTp.length-1])      

                sql1 = sql1.substring(0, sql1.length-2) + ")";
                sql2 = sql2.substring(0, sql2.length-2) + ")";
                sql3 = sql3.substring(0, sql3.length-2) + ")";
                sql4 = sql4.substring(0, sql4.length-2) + ")";

                sql1 = sql1 + sql3;
                sql2 = sql2 + sql4;

                con.query(sql2, queryParams2, function (err, result) {
                    if (err) throw "EpR-ARTp\n" + sql2 + "\n" + err;
                });

                con.query(sql1, queryParams, function (err, result) {
                    if (err) throw "ARTp\n" + sql1 + "\n" + err;
                });
    	    }
    	    else if (que == "ART")
    	    {
    	    	artC++;
    	    	dataTemp = readART(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "ART", artC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_ART (id, idTemp, v1, v2, v3, v4, v5, v6) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                con.query(sql, [artC, actualART.idParent, actualART.v1, actualART.v2, actualART.v3, actualART.v4, actualART.v5, actualART.v6], function (err, result) {
                    if (err) throw "ART\n" + sql + "\n" + err;
                });
    	    }
    	    else if (que == "STA")
    	    {
    	    	staC++;
    	    	dataTemp = readSTA(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "STA", staC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_STA (id, v1, v2) VALUES (?, ?, ?)";
                con.query(sql, [staC, actualSTA.v1, actualSTA.v2], function (err, result) {
                    if (err) throw "STA\n" + sql + "\n" + err;
                });      
    	    }
    	    else if (que == "STAu")
    	    {
    	    	stauC++;
    	    	dataTemp = readSTAu(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "STAu", stauC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_STAu (id, v1, v2, v3, v4) VALUES (?, ?, ?, ?, ?)";
                con.query(sql, [stauC, actualSTAu.v1, actualSTAu.v2, actualSTAu.v3, actualSTAu.v4], function (err, result) {
                    if (err) throw "STAu\n" + sql + "\n" + err;
                });
    	    }
    	    else if (que == "STAp")
    	    {
    	    	stapC++;
    	    	dataTemp = readSTAp(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "STAp", stapC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                var queryParams = [];
                var queryParams2 = [];
                var sql1 = "INSERT INTO anastasiadb_STAp (id, ";
                var sql2 = "INSERT INTO anastasiadb_EpR (id, ";
                var sql3 = " VALUES (" + stapC + ", ";
                var sql4 = " VALUES (" + (stapC + artpC + vqmpC) + ", ";

                for (var x = 0; x < actualSTAp.length; x++)
                {
                    if (x == 14) //EpR
                    {
                        queryParams2.push(actualSTAp[x]);

                        temp = "";
                        for (y = 0; y < actualSTAp[x+1].length; y++)
                        {
                            temp += actualSTAp[x+1][y].toString("hex");
                        }

                        queryParams2.push(temp);
                        x++;

                        sql2 += "len, data, ";
                        sql4 += "?, ?, ";

                        queryParams.push(stapC + artpC + vqmpC);
                        sql1 += "v" + (x+1) + ", ";
                        sql3 += "?, ";              
                    }
                    else
                    {
                        queryParams.push(actualSTAp[x]);
                        
                        sql1 += "v" + (x+1) + ", ";
                        sql3 += "?, ";                        
                    }
                }

                sql1 = sql1.substring(0, sql1.length-2) + ")";
                sql2 = sql2.substring(0, sql2.length-2) + ")";
                sql3 = sql3.substring(0, sql3.length-2) + ")";
                sql4 = sql4.substring(0, sql4.length-2) + ")";

                sql1 = sql1 + sql3;
                sql2 = sql2 + sql4;

                con.query(sql2, queryParams2, function (err, result) {
                    if (err) throw "EpR-STAp\n" + sql2 + "\n" + err;
                });

                con.query(sql1, queryParams, function (err, result) {
                    if (err) throw "STAp\n" + sql1 + "\n" + err;
                });                
    	    }
    	    else if (que == "VQM")
    	    {
    	    	vqmC++;
    	    	dataTemp = readVQM(dataTemp);
                
                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "VQM", vqmC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_VQM (id, v1, v2, v3, v4, v5) VALUES (?, ?, ?, ?, ?, ?)";
                con.query(sql, [vqmC, actualVQM.v1, actualVQM.v2, actualVQM.v3, actualVQM.v4, actualVQM.v5], function (err, result) {
                    if (err) throw "VQM\n" + sql + "\n" + err;
                });                
    	    }
    	    else if (que == "VQMu")
    	    {
    	    	vqmuC++;
    	    	dataTemp = readVQMu(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "VQMu", vqmuC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_VQMu (id, v1, v2, v3, v4) VALUES (?, ?, ?, ?, ?)";
                con.query(sql, [vqmuC, actualVQMu.v1, actualVQMu.v2, actualVQMu.v3, actualVQMu.v4], function (err, result) {
                    if (err) throw "VQMu\n" + sql + "\n" + err;
                });
    	    }
    	    else if (que == "VQMp")
    	    {
    	    	vqmpC++;
    	    	dataTemp = readVQMp(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "VQMp", vqmpC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                var queryParams = [];
                var queryParams2 = [];
                var sql1 = "INSERT INTO anastasiadb_VQMp (id, ";
                var sql2 = "INSERT INTO anastasiadb_EpR (id, ";
                var sql3 = " VALUES (" + vqmpC + ", ";
                var sql4 = " VALUES (" + (stapC + artpC + vqmpC) + ", ";

                for (var x = 0; x < actualVQMp.length; x++)
                {
                    if (x == 8) //EpR
                    {
                        queryParams2.push(actualVQMp[x]);

                        temp = "";
                        for (y = 0; y < actualVQMp[x+1].length; y++)
                        {
                            temp += actualVQMp[x+1][y].toString("hex");
                        }

                        queryParams2.push(temp);
                        x++;

                        sql2 += "len, data, ";
                        sql4 += "?, ?, ";

                        queryParams.push(stapC + artpC + vqmpC);
                        sql1 += "v" + (x+1) + ", ";
                        sql3 += "?, ";              
                    }
                    else
                    {
                        console.log(actualVQMp[x])
                        queryParams.push(actualVQMp[x]);
                        
                        sql1 += "v" + (x+1) + ", ";
                        sql3 += "?, ";                        
                    }
                }

                sql1 = sql1.substring(0, sql1.length-2) + ")";
                sql2 = sql2.substring(0, sql2.length-2) + ")";
                sql3 = sql3.substring(0, sql3.length-2) + ")";
                sql4 = sql4.substring(0, sql4.length-2) + ")";

                sql1 = sql1 + sql3;
                sql2 = sql2 + sql4;

                con.query(sql2, queryParams2, function (err, result) {
                    if (err) throw "EpR-VQMp\n" + sql2 + "\n" + err;
                });

                con.query(sql1, queryParams, function (err, result) {
                    if (err) throw "VQMp2\n" + sql1 + "\n" + "\n" + err;
                });                                
    	    }
    	    else if (que == "TDB")
    	    {
    	    	tdbC++;
    	    	dataTemp = readTDB(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "TDB", tdbC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_TDB (id, v1, v2, v3, v4, v5) VALUES (?, ?, ?, ?, ?, ?)";
                con.query(sql, [tdbC, actualTDB.v1, actualTDB.v2, actualTDB.v3, actualTDB.v4, actualTDB.v5], function (err, result) {
                    if (err) throw "TDB\n" + sql + "\n" + err;
                });                                
    	    }
    	    else if (que == "TMM")
    	    {
    	    	tmmC++;
    	    	dataTemp = readTMM(dataTemp);

                sql = "INSERT INTO anastasiadb_DBV (posicion, tipo, idRefer) VALUES (?, ?, ?)";
                con.query(sql, [voiceBuffer.length-data.length, "TMM", tmmC], function (err, result) {
                    if (err) throw "DBV\n" + sql + "\n" + err;
                });

                sql = "INSERT INTO anastasiadb_TMM (id, v1, v2, v3) VALUES (?, ?, ?, ?)";
                con.query(sql, [tmmC, actualTMM.v1, actualTMM.v2, actualTMM.v3], function (err, result) {
                    if (err) throw "TMM\n" + sql + "\n" + err;
                });                                
    	    }
    	    else if (que == "Owari")
    	    {
    	    	"Termine de parsear el archivo :D"
    	    	break;
    	    }
    	    else
    	    {
                console.log("No se que sea: " + que + " en la posicion " + (voiceBuffer.length - data.length).toString(16));
    	    	//console.log(data);
                data = data.slice(1)

                intentos++

                if (intentos == 10000)
                {
                    continua = false;
                }
    	    }

    	    //console.log("ARR:" + arrC + " ART:" + artC + " ARTu:" + artuC + " ARTp:" + artpC)
        }


        console.log("Esperados: ");
        console.log("EpR: "  + voiceBuffer.toString().split("EpR").length)
    	console.log("ARR: "  + voiceBuffer.toString().split("ARR ").length)
    	console.log("ARTu: " + voiceBuffer.toString().split("ARTu").length)
    	console.log("ARTp: " + voiceBuffer.toString().split("ARTp").length)
    	console.log("ART: "  + voiceBuffer.toString().split("ART ").length)
    	console.log("STA : " + voiceBuffer.toString().split("STA ").length)
    	console.log("STAu: " + voiceBuffer.toString().split("STAu").length)
    	console.log("STAp: " + voiceBuffer.toString().split("STAp").length)
    	console.log("VQM: "  + voiceBuffer.toString().split("VQM ").length)
    	console.log("VQMu: " + voiceBuffer.toString().split("VQMu").length)
    	console.log("TDB: "  + voiceBuffer.toString().split("TDB ").length)
    	console.log("TMM: "  + voiceBuffer.toString().split("TMM ").length)

    	console.log("\nEncontrados: ");
        console.log("ARR: " + arrC);
        console.log("ART: " + artC);
        console.log("ARTu: " + artuC);
        console.log("ARTp: " + artpC);
        console.log("STA: " + staC);
        console.log("STAu: " + stauC);
        console.log("STAp: " + stapC);
    	console.log("VQM: " + vqmC);
        console.log("VQMu: " + vqmuC);
        console.log("VQMp: " + vqmpC);
        console.log("TDB: " + tdbC);
        console.log("TMM: " + tmmC);

        var sql = "SELECT 1";

        con.query(sql, function (err2, result) {
            if (err2) throw err2;

            //PHDCJ
            /*for (var i = 0; i < clases.length; i++)
            {
                sql = "INSERT INTO anastasiadb_PHDCJ (id, type, value) VALUES (?, ?, ?)";
                con.query(sql, [clases[i].id+1, clases[i].class, clases[i].val], function (err, result) {
                    if (err) throw err;
                });
            }*/

            //PHG2
            /*for (var i = 0; i < infClases.length; i++)
            {
                sql = "INSERT INTO anastasiadb_PHG2 (value, info) VALUES (?, ?)";
                console.log(infClases[i])
                con.query(sql, [infClases[i].fonema, infClases[i].info], function (err, result) {
                    if (err) throw err;
                });
            }*/

            con.end(function(){
                console.log("end");
            })
        });
    });    
}

function whois(dataR)
{
	data = dataR;

	if (data.length != 0)
	{
		data = dataR;		
		actual = data.readUInt8(0);

	    while (actual == 0)
	    {
	    	data = data.slice(1);	
	    	actual = data.readUInt8(0);
	    }		

	    return cleanString(data.slice(0,8).toString("utf-8"));
	}
	else
	{
		return "Owari";
	}
}

function readARR(dataR)
{
	console.log("\nEncontre ARR")

	var data = dataR;
    arr = data.slice(0,8).toString("utf-8");
    data = data.slice(4);

    arr1 = data.readUInt8(0);
    data = data.slice(4);

    arr2 = data.readUInt8(0);
    data = data.slice(4);

    arr3 = data.readUInt8(0);
    data = data.slice(4);

    arr4 = data.readUInt8(0);
    data = data.slice(4);

    arr5 = "";

    if (data.readUInt8(0) == -1)
    {
    	data = data.slice(8);
    }
    else if (data.readUInt8(0) <= 30 && data.readUInt8(0) > 0)
    {
    	var len = data.readUInt8(0);
    	data = data.slice(4);

    	if (len > 0 && data.readUInt8(0) >= 0)
    	{
    		arr5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	len = data.readUInt8(0);

    	if (len > 0 && len < 30)
    	{
    		data = data.slice(4);

    		arr5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	len = data.readUInt8(0);

    	if (len > 0 && len < 30)
    	{
    		data = data.slice(4);

    		arr5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	data = data.slice(8);
    }

    actualARR = {"v1": arr1, "v2": arr2, "v3": arr3, "v4": arr4, "v5": arr5.trim()}
    console.log(actualARR)

    return data;
}

function readVQM(dataR)
{
	console.log("\nEncontre VQM")

	var data = dataR;
    vqm = data.slice(0,8).toString("utf-8");
    data = data.slice(4);

    vqm1 = data.readUInt8(0);
    data = data.slice(4);

    vqm2 = data.readUInt8(0);
    data = data.slice(4);

    vqm3 = data.readUInt8(0);
    data = data.slice(4);

    vqm4 = data.readUInt8(0);
    data = data.slice(4);

    vqm5 = "";

    if (data.readUInt8(0) == -1)
    {
    	data = data.slice(8);
    }
    else if (data.readUInt8(0) <= 30 && data.readUInt8(0) > 0)
    {
    	var len = data.readUInt8(0);
    	data = data.slice(4);

    	if (len > 0 && data.readUInt8(0) >= 0)
    	{
    		vqm5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	len = data.readUInt8(0);

    	if (len > 0 && len < 30)
    	{
    		data = data.slice(4);

    		vqm5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	data = data.slice(8);
    }

    actualVQM = {"v1": vqm1, "v2": vqm2, "v3": vqm3, "v4": vqm4, "v5": vqm5.trim()}

    console.log(actualVQM)

    return data;
}

function readTDB(dataR)
{
	console.log("\nEncontre TDB")

	var data = dataR;
    tdb = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    tdb1 = data.readUInt8(0);
    data = data.slice(4);

    tdb2 = data.readUInt8(0);
    data = data.slice(4);

    tdb3 = data.readUInt8(0);
    data = data.slice(4);

    tdb4 = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    tdb5 = "";

    if (data.readUInt8(0) == -1)
    {
    	data = data.slice(8);
    }
    else if (data.readUInt8(0) <= 30 && data.readUInt8(0) > 0)
    {
    	var len = data.readUInt8(0);
    	data = data.slice(4);

    	if (len > 0 && data.readUInt8(0) >= 0)
    	{
    		tdb5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	len = data.readUInt8(0);

    	if (len > 0 && len < 30)
    	{
    		data = data.slice(4);

    		tdb5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	data = data.slice(8);
    }

    actualTDB = {"v1": tdb1, "v2": tdb2, "v3": tdb3, "v4": tdb4, "v5": tdb5.trim()}

    return data;
}

function readSTA(dataR)
{
	console.log("\nEncontre STA")

	var data = dataR;
    sta = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    sta1 = data.readUInt8(0);
    data = data.slice(8);

    sta2 = data.readUInt8(0);
    data = data.slice(8);

    actualSTA = {"v1": sta1, "v2": sta2}

    console.log(actualSTA)

    return data;
}

function readART(dataR)
{
	console.log("\nEncontre ART")

	var data = dataR;		
	actual = data.readUInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readUInt8(0);
    }		

    //Ahora con el primer ART_
    art_ = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    art_1 = data.readUInt8(0);
    data = data.slice(8);

    art_2 = data.readUInt8(0);
    data = data.slice(4);

    art_3 = data.readUInt8(0);
    data = data.slice(4);

    art_4 = data.readUInt8(0);
    data = data.slice(4);

    art_5 = ""
    art_6 = ""

    if (art_3 == 0)
    {
    	//Tipo 2
    	art_5 = data.slice(0, art_4).toString('utf-8');
    	data = data.slice(art_4)

    	art_6 = data.readUInt8(0);

    	if (art_6 != -1)
    	{
		    var temp = data.readUInt8(0);
		    data = data.slice(4);

		    art_5 += " " + data.slice(0, temp).toString('utf-8');
		    data = data.slice(temp);

		    art_6 = data.slice(0,8).toString('utf-8');
		    data = data.slice(8);
    	}
    	else
    	{
    		art_6 = data.slice(0,4);
    		data = data.slice(4);
    	}    	
    }

    //console.log("{" + art_ + " " + art_1 + " " + art_2 + " " + art_3 + "}");

    actualART = {"v1": art_1, "v2": art_2, "v3": art_3, "v4": art_4, "v5" : art_5, "v6": art_6, "idParent": arrC}
    console.log(actualART)
    return data;
}

function readARTu(dataR)
{
	console.log("\nEncontre ARTu")

	var data = dataR;	
	actual = data.readUInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readUInt8(0);
    }		

    //console.log(data);
	//console.log(data.slice(0, 16).toString("utf-8") + ": " + k + " de " + art_3);

    //Ahora con el ARTu
    artu = data.slice(0, 16).toString("utf-8");
    data = data.slice(16);

    artu1 = data.readUInt8(0);
    data  = data.slice(12);

    artu2 = data.slice(0, 8).toString("hex");
    data  = data.slice(8);

    artu3 = data.readUInt8();
    data  = data.slice(4);

    if (artu3 != 0)
    {
        artu4 = data.readUInt8();
        data  = data.slice(8);
    }
    else
    {
        artu4 = data.slice(0,18);
        data  = data.slice(18);
    }

    actualARTu = {"v1": artu1, "v2": artu2, "v3": artu3, "v4": artu4, "idParent": artC}

    console.log(actualARTu)

    return data;
}

function readTMM(dataR)
{
	console.log("\nEncontre TMM")

	var data = dataR;	
	actual = data.readUInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readUInt8(0);
    }		

    //console.log(data);
	//console.log(data.slice(0, 16).toString("utf-8") + ": " + k + " de " + art_3);

    //Ahora con el ARTu
    tmm = data.slice(0, 8).toString("utf-8");
    data = data.slice(8);

    tmm1 = data.readUInt8(0);
    data  = data.slice(12);

    tmm2 = data.readUInt8(0);
    data  = data.slice(4);

    tmm3 = data.slice(0, 8).toString("hex");
    data  = data.slice(8);

    actualTMM = {"v1": tmm1, "v2": tmm2, "v3": tmm3}

    //console.log("[" + artu + " " + artu1 + " " + artu2 + " " + artu3 + " " + artu4 + "]");
    console.log(actualTMM)

    return data;
}

function readVQMu(dataR)
{
	console.log("\nEncontre VQMu")

	var data = dataR;	
	actual = data.readUInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readUInt8(0);
    }		

    //console.log(data);
	//console.log(data.slice(0, 16).toString("utf-8") + ": " + k + " de " + art_3);

    //Ahora con el ARTu
    vqmu = data.slice(0, 8).toString("utf-8");
    data = data.slice(8);

    vqmu1 = data.readUInt8(0);
    data  = data.slice(8);

    vqmu2 = data.readUInt8(0);
    data  = data.slice(4);

    vqmu3 = data.readUInt8(0);
    data  = data.slice(4);

    vqmu4 = data.slice(0, 8).toString("hex");
    data  = data.slice(8);

    actualVQMu = {"v1": vqmu1, "v2": vqmu2, "v3": vqmu3, "v4": vqmu4}

    //console.log("[" + artu + " " + artu1 + " " + artu2 + " " + artu3 + " " + artu4 + "]");
    console.log(actualVQMu)

    return data;
}

function readVQMp(dataR)
{
	console.log("Encontre VQMp")

	var data = dataR;
    actual = data.readUInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readUInt8(0);
    }		

	//console.log(data.slice(0, 12).toString("utf-8") + ": " + j + " de " + vqmu3);
    //Ahora con el ARTp
    vqmp = [];

    vqmp.push(data.slice(0, 12).toString("utf-8"));
    data = data.slice(12);

    vqmp.push(data.readUInt8(0));
    data  = data.slice(4);

    vqmp.push(data.slice(0, 8));
    data  = data.slice(8);

    vqmp.push(data.readUInt8(0));
    data  = data.slice(2);    

    vqmp.push(data.slice(0, 8));
    data  = data.slice(8);

    //ignoramos los siguientes 4
    data  = data.slice(4);

    vqmp.push(data.slice(0, 4));
    data  = data.slice(4);

    //ignoramos los siguientes 2
    data  = data.slice(2);

    vqmp.push(data.slice(0, 2));
    data  = data.slice(2);

    //ignoramos los siguientes 2
    data  = data.slice(4);

    vqmp.push(data.slice(0, 4));
    data  = data.slice(4);

    var iter = data.readUInt8(0)
    vqmp.push(data.readUInt8(0));
    data  = data.slice(4);    

    vqmp2 = []

    for (i = 0; i < iter; i++)
    {
    	vqmp2.push(data.slice(0, 8));
		data  = data.slice(8);
    }

    vqmp.push(vqmp2);

    vqmp.push(data.slice(0, 4));
    data  = data.slice(4);

    vqmp.push(data.readUInt8(0));
    data  = data.slice(3);

    vqmp.push(data.readUInt8(0));
    data  = data.slice(3);

    vqmp.push(data.slice(0, 4));
    data  = data.slice(8);

    vqmp.push(data.slice(0, 16));
    data  = data.slice(16);

    vqmp.push(data.readUInt8(0));
    data  = data.slice(4);

    vqmp.push(data.slice(0, 2));
    data  = data.slice(5);

    vqmp.push(data.slice(0, 6));
    data  = data.slice(9);
    
    vqmp.push(data.slice(0, 4));
    data  = data.slice(7);

    vqmp.push(data.slice(0, 5));
    data  = data.slice(5);

    vqmp.push(data.slice(0, 8));
    data  = data.slice(8);
    
    actualVQMp = vqmp;

    return data;
}

function readSTAu(dataR)
{
	console.log("\nEncontre STAu")

	var data = dataR;	
	actual = data.readUInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readUInt8(0);
    }		

    //Ahora con el ARTu
    stau = data.slice(0, 8).toString("utf-8");
    data = data.slice(8);

    stau1 = data.readUInt8(0);
    data  = data.slice(8);

    stau2 = data.readUInt8();
    data  = data.slice(4);

    stau3 = data.slice(0,8).toString('utf-8');
    data  = data.slice(8);

    stau4 = data.readUInt8();
    data  = data.slice(12);

    actualSTAu = {"v1": stau1, "v2": stau2, "v3": stau3, "v4": stau4, "idParent": stapC}
    console.log(actualSTAu)

    return data;
}

function readARTp(dataR)
{
	console.log("Encontre ARTp")

	var data = dataR;
    actual = data.readUInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readUInt8(0);
    }		

    //Ahora con el ARTp
    artp = [];

    artp.push(data.slice(0, 12).toString("utf-8"));
    data = data.slice(12);

    artp.push(data.readUInt8(0));
    data  = data.slice(4);

    artp.push(data.slice(0, 8));
    data  = data.slice(8);

    artp.push(data.readUInt8(0));
    data  = data.slice(2);    

    artp.push(data.slice(0, 12));
    data  = data.slice(12);

    artp.push(data.slice(0, 6));
    data  = data.slice(6);

    artp.push(data.slice(0, 6));
    data  = data.slice(6);

    artp.push(data.slice(0, 8));
    data  = data.slice(8);

    artp.push(data.slice(0,8));
    data  = data.slice(8);

    artp.push(data.readUInt8(0));
    data  = data.slice(4);

    artp.push(data.slice(0, 11));
    data  = data.slice(11);

    artp.push(data.slice(0, 8));
    data  = data.slice(8);

    artp.push(data.readUInt8(0));
    data  = data.slice(4);

    artp.push(data.slice(0, 3));
    data  = data.slice(3);

    artp.push(data.readUInt8(0));
    iter = data.readUInt8(0);
    data  = data.slice(1);

    data = data.slice(3);

    artp2 = []

    for (i = 0; i < iter; i++)
    {
    	artp2.push(data.slice(0, 8));
		data  = data.slice(8);
    }

    artp.push(artp2);

    artp.push(data.slice(0, 4));
    data  = data.slice(4);

    artp.push(data.readUInt8(0));
    data  = data.slice(3);

    artp.push(data.readUInt8(0));
    data  = data.slice(3);

    artp.push(data.slice(0, 4));
    data  = data.slice(8);

    artp.push(data.slice(0, 4));
    data  = data.slice(8);

    tmpstr = ""
    for (h = 0; h < 10; h++)
    {
    	if (data.readUInt8(0) < 10)
    	{
    		tmpstr += "0" + data.readUInt8(0) + " ";
    	}
    	else
    	{
    		tmpstr += data.readUInt8(0) + " ";
    	}

	    artp.push(data.readUInt8(0));
	    data  = data.slice(4);
    }

    artp.push(data.slice(0, 7));
    data  = data.slice(7);

    artp.push(data.slice(0, 8));
    data  = data.slice(8);

    //Calculate the padding
    for (k = 0; k < 100; k++)
    {
    	var que2 = data.slice(k,k+4);

    	if (que2 == "ARR " || que2 == "ARTu" || 
    		que2 == "ARTp" || que2 == "ART " ||
    		que2 == "STA " || que2 == "STAp" ||
    		que2 == "STAu" || que2 == "norm")
	    {
	    	artp.push(data.slice(0, k));
		    data  = data.slice(k);

	    	break;
	    }
    }

    artp.push(artuC)

    actualARTp = artp;
    
    return data;
}

function readSTAp(dataR)
{
	console.log("Encontre STAp")

	var data = dataR;
    actual = data.readUInt8(0);

    console.log(data)

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readUInt8(0);
    }		

	//console.log(data.slice(0, 12).toString("utf-8") + ": " + j + " de " + stau3);
    //Ahora con el ARTp
    stap = [];

    stap.push(data.slice(0, 12).toString("utf-8"));
    data = data.slice(12);

    stap.push(data.readUInt8(0));
    data  = data.slice(4);

    stap.push(data.slice(0, 8));
    data  = data.slice(8);

    stap.push(data.readUInt8(0));
    data  = data.slice(2);    

    stap.push(data.slice(0, 12));
    data  = data.slice(12);

    stap.push(data.slice(0, 6));
    data  = data.slice(6);

    stap.push(data.slice(0, 6));
    data  = data.slice(6);

    stap.push(data.slice(0, 8));
    data  = data.slice(8);

    stap.push(data.slice(0,8));
    data  = data.slice(8);

    stap.push(data.readUInt8(0));
    data  = data.slice(4);

    stap.push(data.slice(0, 11));
    data  = data.slice(11);

    stap.push(data.slice(0, 8));
    data  = data.slice(8);

    stap.push(data.readUInt8(0));
    data  = data.slice(4);

    stap.push(data.slice(0, 3));
    data  = data.slice(3);

    stap.push(data.readUInt8(0));
    iter = data.readUInt8(0);
    data  = data.slice(1);

    data = data.slice(3); //EpR
    data = data.slice(4);

    console.log(data.readUInt8(0))

    iter = data.readUInt8(0);
    data  = data.slice(4);    

    console.log(iter)

    stap2 = []

    for (i = 0; i < iter; i++)
    {
    	stap2.push(data.slice(0, 8));
		data  = data.slice(8);
    }

    stap.push(stap2);

    stap.push(data.slice(0, 4));
    data  = data.slice(4);

    stap.push(data.readUInt8(0));
    data  = data.slice(3);

    stap.push(data.readUInt8(0));
    data  = data.slice(3);

    stap.push(data.slice(0, 4));
    data  = data.slice(8);

    stap.push(data.slice(0, 4));
    data  = data.slice(8);

    stap.push(data.readUInt8(0));
    data  = data.slice(4);

    stap.push(data.readUInt8(0));
    data  = data.slice(4);

    stap.push(data.readUInt8(0));
    data  = data.slice(4);

    stap.push(data.readUInt8(0));
    data  = data.slice(4);

    var len = data.readUInt8(0);

    if (len == 0)
    {
    	data = data.slice(1);
    }

    len = data.readUInt8(0);

    if (len.toString(16) == "6f")
    {
    	data = data.slice(1);
    	len = data.readUInt8(0);
    	data = data.slice(4);

    	var tempVar = "";
	    while (len > 0)
	    {
	    	tempVar += " " + data.slice(0, len).toString('utf-8');
	    	data = data.slice(len);

	    	console.log(tempVar)

		    var len = data.readUInt8(0);
		    data  = data.slice(4);
	    }

	    stap.push(tempVar)
    }
    else
    {
		data = data.slice(4);	
    }	

    stap.push(stauC)

    actualSTAp = stap;
    console.log(actualSTAp)
    //console.log("ARTp");
    //console.log(stap);
    //console.log(data);
    
    return data;
}

function logChunk(data, size)
{
	console.log("Data");
    console.log(data);

    chuncks = data.slice(0, size);

    posRais = [];
    raised = false;
    temp = "";
    contador = 0;
    lastPos = 0;
    for (j = 0; j < chuncks.length; j++)
    {
    	if (data[j].toString() !== "0")
    	{
    		if (raised)
    		{
    			contador++;
    			temp += " [" + String.fromCharCode(data[j]) + "/" + data[j] + "/" + chuncks.slice(j, j+1).toString('hex') + "]";
    			continue;
    		}
    		else
    		{
    			contador++;
    			raised = true;
    			temp = "[" + String.fromCharCode(data[j]) + "/" + data[j] + "/" + chuncks.slice(j, j+1).toString('hex') + "]";
    		}
    	}	
    	else
    	{
    		if (raised)
    		{
    			posRais.push({"pos": j - contador, "len": j - contador - lastPos, "val": temp});

    			lastPos = j - contador;
    			contador = 0;
    			temp = "";
    			raised = false;
    		}
    	}
    }

    console.log(posRais);
}

function cleanString(string)
{
    chars = "1234567890*/-+abcdefghijklmnopqrstuvwxyz<>°!\"#$%&/()=?¡}]'[{¬½~·@|¬}]"
    clean = "";

    for (var i = 0; i < string.length; i++)
    {
        if (chars.indexOf(string[i].toLowerCase()) >= 0)
        {
            clean += string[i];
        }
    }

    return clean;
}

data = fs.readFileSync("Megpoid_English.ddi");
console.log(validateVoiceBank(data));
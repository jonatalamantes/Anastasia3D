var fs  = require('fs')
var mysql = require('mysql')

function validateVoiceBank(voiceBuffer)
{   
    fonemas   = [];
    clases    = [];
    infClases = [];
    key       = "";
    artC      = 0;
    artP      = 0;
    artU      = 0;

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

    if (data.readInt8(0) == 1)
    {
        data = data.slice(12);
    }
    else
    {
        return -2
    }

    if (data.slice(0,5).equals(new Buffer("PHDCJ")))
    {
        console.log("Procesando PHDCJ");
        data = data.slice(12);
    }

    tam = data.readInt8(0);
    data = data.slice(3);

    for (var i = 0;  i < tam; i++)
    {
        text = cleanString(data.slice(0,31).toString());
        data = data.slice(31);
        fonemas.push(text);
    }

    //Process the next part
    if (data.readInt8(0) == 1)
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

    tamClases = data.readInt8(0);
    data = data.slice(4);

    for (var i = 0; i < tamClases; i++)
    {
        classLen = data.readInt8(0);
        data = data.slice(4);

        className = cleanString(data.slice(0,classLen).toString());
        data = data.slice(classLen);

        instances = data.readInt8(0);
        data = data.slice(4);

        for (var j = 0; j < instances; j++)
        {
            id   = data.readInt8(0);
            data = data.slice(4);

            cantidad = data.readInt8(0);
            data = data.slice(4);

            text = data.slice(0, cantidad).toString();
            data = data.slice(cantidad);

            clases.push({id: id, class: className, val: text});
        }

        data = data.slice(4);
    }

    /*var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "rt3xp@n0",
        multipleStaments: true,
        database: "AnastasiaDB"
    });

    for (var i = 0; i < clases.length; i++)
    {
        sql = "INSERT INTO anastasiadb_PHDCJ (numero, type, value) VALUES (?, ?, ?)";
        con.query(sql, [clases[i].id, clases[i].class, clases[i].val], function (err, result) {
            if (err) throw err;
        });
    }

    console.log(clases);*/

    len1 = data.readInt8(0);
    data = data.slice(4);    

    len2 = data.readInt8(0);

    for (k = 0; k < len1; k++)
    {
        var char1 = cleanString(data.slice(0, 32).toString('utf-8'));
        var begin = data.readInt8(32);
        var inf = data.slice(48, 100); //len2

        infClases.push({"fonema": char1, "tipo": begin, "info": inf});
        data = data.slice(100);
    }

    //Read the Long Key
    key = cleanString(data.slice(0, 32).toString('utf-8'));
    data = data.slice(32);
    data = data.slice(228);

    var1 = data.readInt8(0);
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

    var2 = data.readInt8(0);
    data = data.slice(8);

    var3 = data.readInt8(0);
    data = data.slice(12);

    console.log("DBV" + " " + var1 + " " + var2 + " " + var3);

    for (var x = 0; x < var2; x++)
    {
        //Read the ARR
        console.log(data);
        readARR(data);
    }
}

function readARR(dataR)
{
	console.log("\nEncontre ARR")

	data = dataR;
    arr = data.slice(0,8).toString("utf-8");
    data = data.slice(4);

    arr1 = data.readInt8(0);
    data = data.slice(4);

    arr2 = data.readInt8(0);
    data = data.slice(4);

    arr3 = data.readInt8(0);
    data = data.slice(4);

    arr4 = data.readInt8(0);
    data = data.slice(4);

    arr5 = "";

    actualARR = {"v1": arr1, "v2": arr2, "v3": arr3, "v4": arr4, "v5": arr5.trim()}
    console.log(actualARR)

    for (var i = 0; i < arr4; i++)
    {
        readART(data, i+1);
    }

    return data;
}

function readVQM(dataR)
{
	console.log("\nEncontre VQM")

	data = dataR;
    vqm = data.slice(0,8).toString("utf-8");
    data = data.slice(4);

    vqm1 = data.readInt8(0);
    data = data.slice(4);

    vqm2 = data.readInt8(0);
    data = data.slice(4);

    vqm3 = data.readInt8(0);
    data = data.slice(4);

    vqm4 = data.readInt8(0);
    data = data.slice(4);

    vqm5 = "";

    if (data.readInt8(0) == -1)
    {
    	data = data.slice(8);
    }
    else if (data.readInt8(0) <= 30 && data.readInt8(0) > 0)
    {
    	var len = data.readInt8(0);
    	data = data.slice(4);

    	if (len > 0 && data.readInt8(0) >= 0)
    	{
    		vqm5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	len = data.readInt8(0);

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

	data = dataR;
    tdb = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    tdb1 = data.readInt8(0);
    data = data.slice(4);

    tdb2 = data.readInt8(0);
    data = data.slice(4);

    tdb3 = data.readInt8(0);
    data = data.slice(4);

    tdb4 = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    tdb5 = "";

    if (data.readInt8(0) == -1)
    {
    	data = data.slice(8);
    }
    else if (data.readInt8(0) <= 30 && data.readInt8(0) > 0)
    {
    	var len = data.readInt8(0);
    	data = data.slice(4);

    	if (len > 0 && data.readInt8(0) >= 0)
    	{
    		tdb5 += " " + data.slice(0, len);
    		data = data.slice(len);
    	}

    	len = data.readInt8(0);

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

	data = dataR;
    sta = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    sta1 = data.readInt8(0);
    data = data.slice(8);

    sta2 = data.readInt8(0);
    data = data.slice(8);

    actualSTA = {"v1": sta1, "v2": sta2}

    console.log(actualSTA)

    return data;
}

function readART(dataR, num)
{
    artC++;
	console.log("\nEncontre ART " + num + "/ART:" + artC + "/ARTu:" + artU + "/ARTp:" + artP)

	data = dataR;		
	actual = data.readInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

    //Ahora con el primer ART_
    art_ = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    art_1 = data.readInt8(0);
    data = data.slice(8);

    art_2 = data.readInt8(0);
    data = data.slice(4);

    art_3 = data.readInt8(0);
    data = data.slice(4);

    art_4 = data.readInt8(0);
    data = data.slice(4);

    art_5 = ""
    art_6 = ""

    //console.log("{" + art_ + " " + art_1 + " " + art_2 + " " + art_3 + "}");

    actualART = {"v1": art_1, "v2": art_2, "v3": art_3, "v4": art_4, "v5" : art_5, "v6": art_6}
    console.log(actualART)

    for (var artVar = 0; artVar < art_3; artVar++)
    {
        readARTu(data, artVar+1);
    }

    data = data.slice(5);
    console.log(data);

    return data;
}

function readARTu(dataR, num)
{
    artU++;
	console.log("Encontre ARTu " + num + "/ART:" + artC + "/ARTu:" + artU + "/ARTp:" + artP)

	data = dataR;	
	actual = data.readInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

    //console.log(data);
	//console.log(data.slice(0, 16).toString("utf-8") + ": " + k + " de " + art_3);

    //Ahora con el ARTu
    artu = data.slice(0, 16).toString("utf-8");
    data = data.slice(16);

    artu1 = data.readInt8(0);
    data  = data.slice(12);

    artu2 = data.slice(0, 8).toString("hex");
    data  = data.slice(8);

    artu3 = data.readInt8();
    data  = data.slice(4);

    artu4 = data.readInt8();
    data  = data.slice(8);

    actualARTu = {"v1": artu1, "v2": artu2, "v3": artu3, "v4": artu4}

    console.log(actualARTu)

    for (var y = 0; y < artu3; y++)
    {
        readARTp(data, y+1);
    }

    data = data.slice(5);

    console.log(data);

    return data;
}

function readTMM(dataR)
{
	console.log("\nEncontre TMM")

	data = dataR;	
	actual = data.readInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

    //console.log(data);
	//console.log(data.slice(0, 16).toString("utf-8") + ": " + k + " de " + art_3);

    //Ahora con el ARTu
    tmm = data.slice(0, 8).toString("utf-8");
    data = data.slice(8);

    tmm1 = data.readInt8(0);
    data  = data.slice(12);

    tmm2 = data.readInt8(0);
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

	data = dataR;	
	actual = data.readInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

    //console.log(data);
	//console.log(data.slice(0, 16).toString("utf-8") + ": " + k + " de " + art_3);

    //Ahora con el ARTu
    vqmu = data.slice(0, 8).toString("utf-8");
    data = data.slice(8);

    vqmu1 = data.readInt8(0);
    data  = data.slice(8);

    vqmu2 = data.readInt8(0);
    data  = data.slice(4);

    vqmu3 = data.readInt8(0);
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

	data = dataR;
    actual = data.readInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

	//console.log(data.slice(0, 12).toString("utf-8") + ": " + j + " de " + vqmu3);
    //Ahora con el ARTp
    vqmp = [];

    vqmp.push(data.slice(0, 12).toString("utf-8"));
    data = data.slice(12);

    vqmp.push(data.readInt8(0));
    data  = data.slice(4);

    vqmp.push(data.slice(0, 8));
    data  = data.slice(8);

    vqmp.push(data.readInt8(0));
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

    var iter = 256 + data.readInt8(0)
    vqmp.push(256 + data.readInt8(0));
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

    vqmp.push(data.readInt8(0));
    data  = data.slice(3);

    vqmp.push(256 + data.readInt8(0));
    data  = data.slice(3);

    vqmp.push(data.slice(0, 4));
    data  = data.slice(8);

    vqmp.push(data.slice(0, 16));
    data  = data.slice(16);

    vqmp.push(data.readInt8(0));
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

	data = dataR;	
	actual = data.readInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

    //Ahora con el ARTu
    stau = data.slice(0, 8).toString("utf-8");
    data = data.slice(8);

    stau1 = data.readInt8(0);
    data  = data.slice(8);

    stau2 = data.readInt8();
    data  = data.slice(4);

    stau3 = data.slice(0,8).toString('utf-8');
    data  = data.slice(8);

    stau4 = data.readInt8();
    data  = data.slice(12);

    actualSTAu = {"v1": stau1, "v2": stau2, "v3": stau3, "v4": stau4}
    console.log(actualSTAu)

    return data;
}

function readARTp(dataR, num)
{
    artP++;
	console.log("Encontre ARTp " + num + "/ART:" + artC + "/ARTu:" + artU + "/ARTp:" + artP)

	data = dataR;
    actual = data.readInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

    //Ahora con el ARTp
    artp = [];

    artp.push(data.slice(0, 12).toString("utf-8"));
    data = data.slice(12);

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    artp.push(data.slice(0, 8));
    data  = data.slice(8);

    artp.push(data.readInt8(0));
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

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    artp.push(data.slice(0, 11));
    data  = data.slice(11);

    artp.push(data.slice(0, 8));
    data  = data.slice(8);

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    artp.push(data.slice(0, 3));
    data  = data.slice(3);

    artp.push(data.readInt8(0));
    iter = data.readInt8(0);
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

    artp.push(data.readInt8(0));
    data  = data.slice(3);

    artp.push(data.readInt8(0));
    data  = data.slice(3);

    artp.push(data.slice(0, 4));
    data  = data.slice(8);

    artp.push(data.slice(0, 4));
    data  = data.slice(8);

    tmpstr = ""
    for (h = 0; h < 10; h++)
    {
    	if (data.readInt8(0) < 10)
    	{
    		tmpstr += "0" + data.readInt8(0) + " ";
    	}
    	else
    	{
    		tmpstr += data.readInt8(0) + " ";
    	}

	    artp.push(data.readInt8(0));
	    data  = data.slice(4);
    }

    artp.push(data.slice(0, 7));
    data  = data.slice(7);

    artp.push(data.slice(0, 8));
    data  = data.slice(8);

    actualARTp = artp;
    
    return data;
}

function readSTAp(dataR)
{
	console.log("Encontre STAp")

	data = dataR;
    actual = data.readInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

	//console.log(data.slice(0, 12).toString("utf-8") + ": " + j + " de " + stau3);
    //Ahora con el ARTp
    stap = [];

    stap.push(data.slice(0, 12).toString("utf-8"));
    data = data.slice(12);

    stap.push(data.readInt8(0));
    data  = data.slice(4);

    stap.push(data.slice(0, 8));
    data  = data.slice(8);

    stap.push(data.readInt8(0));
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

    stap.push(data.readInt8(0));
    data  = data.slice(4);

    stap.push(data.slice(0, 11));
    data  = data.slice(11);

    stap.push(data.slice(0, 8));
    data  = data.slice(8);

    stap.push(data.readInt8(0));
    data  = data.slice(4);

    stap.push(data.slice(0, 3));
    data  = data.slice(3);

    stap.push(data.readInt8(0));
    iter = data.readInt8(0);
    data  = data.slice(1);

    data = data.slice(3); //EpR
    data = data.slice(4);

    iter = 256 + data.readInt8(0);
    data  = data.slice(1);    
    data = data.slice(3); 

    stap2 = []

    for (i = 0; i < iter; i++)
    {
    	stap2.push(data.slice(0, 8));
		data  = data.slice(8);
    }

    stap.push(stap2);

    stap.push(data.slice(0, 4));
    data  = data.slice(4);

    stap.push(data.readInt8(0));
    data  = data.slice(3);

    stap.push(data.readInt8(0));
    data  = data.slice(3);

    stap.push(data.slice(0, 4));
    data  = data.slice(8);

    stap.push(data.slice(0, 4));
    data  = data.slice(8);

    stap.push(data.readInt8(0));
    data  = data.slice(4);

    stap.push(data.readInt8(0));
    data  = data.slice(4);

    stap.push(data.readInt8(0));
    data  = data.slice(4);

    stap.push(data.readInt8(0));
    data  = data.slice(4);

    var len = data.readInt8(0);

    if (len == 0)
    {
    	data = data.slice(1);
    }

    len = data.readInt8(0);

    if (len.toString(16) == "6f")
    {
    	data = data.slice(1);
    	len = data.readInt8(0);
    	data = data.slice(4);

    	var tempVar = "";
	    while (len > 0)
	    {
	    	tempVar += " " + data.slice(0, len).toString('utf-8');
	    	data = data.slice(len);

	    	console.log(tempVar)

		    var len = data.readInt8(0);
		    data  = data.slice(4);
	    }

	    stap.push(tempVar)
    }
    else
    {
		data = data.slice(4);	
    }	

    actualSTAp = stap;
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

data = fs.readFileSync("Megpoid_V4_Sweet.ddi");
validateVoiceBank(data);
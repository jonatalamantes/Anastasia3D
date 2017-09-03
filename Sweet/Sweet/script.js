 var fs  = require('fs')

function validateVoiceBank(voiceBuffer)
{   
    fonemas   = [];
    clases    = [];
    infClases = [];
    key       = "";

    data = voiceBuffer;
    console.log(data.toString().split("EpR").length)

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

    //Exploramos la primera parte que es la ARR
    continua = true;
    arrC   = 0;
    artC   = 0;
    artuC  = 0;
    artpC  = 0;

    actualArr  = null;
    actualArt  = null;
    actualArtu = null;
    actualArtp = null;

    while (continua)
    {
    	que = whois(data);

    	//console.log(data);
    	//console.log(que);

	    if (que == "ARR")
	    {
	    	arrC++;
	    	data = readARR(data);
	    }
	    else if (que == "ARTu")
	    {
	    	artuC++;
	    	data = readARTu(data);
	    }
	    else if (que == "ARTp")
	    {
	    	artpC++;
	    	data = readARTp(data);
	    }
	    else if (que == "ART")
	    {
	    	artC++;
	    	data = readART(data);
	    }
	    else
	    {
	    	continua = false;
	    }

	    //console.log("ARR:" + arrC + " ART:" + artC + " ARTu:" + artuC + " ARTp:" + artpC)
    }

	/*

	console.log("ARR");	
    console.log(arr);
    console.log(arr1);
    console.log(arr2);

    console.log("ART_");
    console.log(art_);
    console.log(art_1);
    console.log(art_2);
    console.log(art_3);

    console.log("ARTu");
    console.log(artu);
    console.log(artu1);
    console.log(artu2);
    console.log(artu3);
    console.log(artu4);


    //console.log(fonemas);
    //console.log(clases);
    //console.log(infClases);
    //console.log(key);
    //*/

    return "";

    console.log("Data");
    console.log(data);

}

function whois(dataR)
{
	data = dataR;

	data = dataR;		
	actual = data.readInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

    return cleanString(data.slice(0,8).toString("utf-8"));
}

function readARR(dataR)
{
	data = dataR;
    arr = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    arr1 = data.readInt8(0);
    data = data.slice(8);

    arr2 = data.readInt8(0);
    data = data.slice(8);

    actualArr = {"v1": arr1, "v2": arr2}

    return data;
}

function readART(dataR)
{
	data = dataR;		
	actual = data.readInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

    console.log(data);
	//console.log(data.slice(0,8).toString("utf-8") + ": " + m + " de " + arr2);

    //Ahora con el primer ART_
    art_ = data.slice(0,8).toString("utf-8");
    data = data.slice(8);

    art_1 = data.readInt8(0);
    data = data.slice(8);

    art_2 = data.readInt8(0);
    data = data.slice(4);

    art_3 = data.readInt8(0);
    data = data.slice(8);

    //console.log("{" + art_ + " " + art_1 + " " + art_2 + " " + art_3 + "}");

    actualArt = {"v1": art_1, "v2": art_2, "v3": art_3}
    return data;
}

function readARTu(dataR)
{
	data = dataR;	
	actual = data.readInt8(0);

	while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

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

    actualArtu = {"v1": artu1, "v2": artu2, "v3": artu3, "v4": artu4}

    //console.log("[" + artu + " " + artu1 + " " + artu2 + " " + artu3 + " " + artu4 + "]");

    return data;
}

function readARTp(dataR)
{
	data = dataR;
    actual = data.readInt8(0);

    while (actual == 0)
    {
    	data = data.slice(1);	
    	actual = data.readInt8(0);
    }		

	//console.log(data.slice(0, 12).toString("utf-8") + ": " + j + " de " + artu3);

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

    //artp.push(artp2);

    artp.push(data.slice(0, 4));
    data  = data.slice(4);

    artp.push(data.readInt8(0));
    data  = data.slice(3);

    artp.push(data.readInt8(0));
    data  = data.slice(2);

    artp.push(data.slice(0, 6));
    data  = data.slice(6);

    artp.push(data.slice(0, 7));
    data  = data.slice(7);

    data  = data.slice(4);

    artp.push(data.readInt8(0));
    data  = data.slice(8);

    artp.push(data.readInt8(0));
    data  = data.slice(8);

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    artp.push(data.readInt8(0));
    data  = data.slice(4);

    last   = [];
    actual = data.slice(0,2);

    while (actual.toString("utf-8") !== "AR")
    {	
    	last.push(actual)
		data   = data.slice(2);
	    actual = data.slice(0,2);
    }

    artp.push(last);

    actualArtp = artp;
    //console.log("ARTp");
    //console.log(artp);
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
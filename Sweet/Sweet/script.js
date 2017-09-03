 var fs  = require('fs')

function validateVoiceBank(voiceBuffer)
{   
    fonemas   = [];
    clases    = [];
    infClases = [];
    key       = "";

    data = voiceBuffer;
    //console.log(data.toString().split("pitch").length)

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

    console.log(var1);
    console.log(var2);

    //console.log(fonemas);
    //console.log(clases);
    //console.log(infClases);
    //console.log(key);
    //

    console.log("Data");
    console.log(data);

    chuncks = data.slice(0, 8000);

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
    			temp += " " + data[j];
    			continue;
    		}
    		else
    		{
    			contador++;
    			raised = true;
    			temp += " " + data[j];
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

    //console.log(data);

    //data = data.slice(x2);


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

fs.readFile("Megpoid_V4_Sweet.ddi", function(error, data){
	if (error) throw err;

    validateVoiceBank(data);

	
    /*for (i = 0; i < data.length; i++)
    {
        console.log(data.readInt8(i));
    }*/

	//console.log(data.split("ART").length);
});

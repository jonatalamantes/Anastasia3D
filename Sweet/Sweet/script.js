var fs  = require('fs')

function validateVoiceBank(voiceBuffer)
{   
    fonemas = [];
    clases  = [];
    data = voiceBuffer;
    console.log(data.toString().split("pitch").length)

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

    /*
    if (data.slice(0, 6).equals(new Buffer("Vowels")))
    {
        data = data.slice(6);
        tam  = data.readInt8(0);

        data = data.slice(9);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,10).toString());
            data = data.slice(10);
            clases.push({class: "Vowels", val: text});
        }
    }

    data = data.slice(3);

    if (data.slice(0, 6).equals(new Buffer("Nasals")))
    {
        data = data.slice(6);
        tam  = data.readInt8(0);

        data = data.slice(8);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,10).toString());
            data = data.slice(10);
            clases.push({class: "Nasals", val: text});
        }
    }

    data = data.slice(6);

    if (data.slice(0, 14).equals(new Buffer("VoicedPlosives")))
    {
        data = data.slice(14);
        tam  = data.readInt8(0);

        data = data.slice(9);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,9).toString());
            data = data.slice(9);
            clases.push({class: "VoicedPlosives", val: text});
        }
    }

    data = data.slice(6);

    if (data.slice(0, 16).equals(new Buffer("VoicedFricatives")))
    {
        data = data.slice(16);
        tam  = data.readInt8(0);

        data = data.slice(9);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,9).toString());
            data = data.slice(9);
            clases.push({class: "VoicedFricatives", val: text});
        }
    }

    data = data.slice(4);

    if (data.slice(0, 16).equals(new Buffer("VoicedAffricates")))
    {
        data = data.slice(16);
        tam  = data.readInt8(0);

        data = data.slice(9);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,9).toString());
            data = data.slice(9);
            clases.push({class: "VoicedAffricates", val: text});
        }
    }

    data = data.slice(5);

    if (data.slice(0, 7).equals(new Buffer("Liquids")))
    {
        data = data.slice(7);
        tam  = data.readInt8(0);

        data = data.slice(9);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,9).toString());
            data = data.slice(9);
            clases.push({class: "Liquids", val: text});
        }
    }

    data = data.slice(4);

    if (data.slice(0, 10).equals(new Buffer("Semivowels")))
    {
        data = data.slice(10);
        tam  = data.readInt8(0);

        data = data.slice(9);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,9).toString());
            data = data.slice(9);
            clases.push({class: "Semivowels", val: text});
        }
    }

    data = data.slice(3);

    if (data.slice(0, 9).equals(new Buffer("Syllables")))
    {
        data = data.slice(9);
        tam  = data.readInt8(0);

        data = data.slice(9);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,10).toString());
            data = data.slice(10);
            clases.push({class: "Syllables", val: text});
        }
    }

    data = data.slice(3);

    if (data.slice(0, 9).equals(new Buffer("UnvoicedPlosives")))
    {
        data = data.slice(9);
        tam  = data.readInt8(0);

        data = data.slice(9);

        for (var i = 0; i < tam; i++)
        {
            text = cleanString(data.slice(0,10).toString());
            data = data.slice(10);
            clases.push({class: "UnvoicedPlosives", val: text});
        }
    }*/

    //console.log(fonemas);
    console.log(clases);
    console.log(data);

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

    console.log(validateVoiceBank(data));

	
    /*for (i = 0; i < data.length; i++)
    {
        console.log(data.readInt8(i));
    }*/

	//console.log(data.split("ART").length);
});

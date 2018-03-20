import sys


def dumpFile(f):
	dic = {}
	dic["sign"]       = "SND "
	dic["size"]       = int.from_bytes(f.read(4), byteorder='little')-18
	dic["frecuency"]  = int.from_bytes(f.read(4), byteorder='little')
	dic["channel"]    = int.from_bytes(f.read(2), byteorder='little')
	dic["dummy"]      = int.from_bytes(f.read(4), byteorder='little')
	dic["bits"]       = 16
	dic["block"]      = dic["bits"] /8 * dic["channel"]
	dic["avg"]        = dic["frecuency"] * dic["block"]
	print(dic)

	riff = bytearray(b"RIFF")
	riff += int(dic["size"] + 36).to_bytes(4, byteorder='little')
	riff += (b"WAVE")
	riff += (b"fmt ")
	riff += int(16).to_bytes(4, byteorder='little')
	riff += int(1).to_bytes(2, byteorder='little')
	riff += int(dic["channel"]).to_bytes(2, byteorder='little')
	riff += int(dic["frecuency"]).to_bytes(4, byteorder='little')
	riff += int(dic["avg"]).to_bytes(4, byteorder='little')
	riff += int(dic["block"]).to_bytes(2, byteorder='little')
	riff += int(dic["bits"]).to_bytes(2, byteorder='little')
	riff += (b"data")
	riff += int(dic["size"]).to_bytes(4, byteorder='little')

	for j in range(0, dic["size"]):
		riff += f.read(1)

	fileRiff = open("extracted/" + str(i).zfill(6) + " - " + str(format(c, '02x')) + ".wav", 'wb')
	fileRiff.write(riff) 
	fileRiff.close()

	print(riff)

src = []
i = 0
c = 0
c2 = 0

with open("Megpoid_English.ddb", 'rb') as f:
	while True:
		c+=1
		c2+=1
		b = f.read(1)
		if not b:
			break
		
		src.append(b)

		if (c >= 4):
			tempList = src[-4:]

			if (tempList[0] == b"S" and
				tempList[1] == b"N" and
				tempList[2] == b"D" and
				tempList[3] == b" "):
				print( "SND : " + str(format(c, '02x')) + ", " + str(c))
				dumpFile(f)
				i+=1
				src = []
				c = 0

			if (tempList[0] == b"F" and
				tempList[1] == b"R" and
				tempList[2] == b"M" and
				tempList[3] == b"2"):
				print("FRM2: " + str(format(c, '02x')) + ", " + str(c))

			if (tempList[0] == b"E" and
				tempList[1] == b"N" and
				tempList[2] == b"V" and
				tempList[3] == b" "):
				print("ENV : " + str(format(c, '02x')) + ", " + str(c))

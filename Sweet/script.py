import os

for i in range(1672):
    msj = "mv " + str(i) + ".wav " + str(i).zfill(4) + ".wav";
    os.system(msj)

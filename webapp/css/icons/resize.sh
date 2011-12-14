#!/bin/bash
rm -f *.resized.png
for i in *.png
do
	sips -Z 32 $i --out ${i%%.*}.resized.png
done

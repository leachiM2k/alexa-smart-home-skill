#!/bin/bash
LAMBDA_NAME=433Remote
ZIP_FILE=$LAMBDA_NAME-dist.zip

rm -f $ZIP_FILE
zip -X -r $ZIP_FILE *.js schema/*.json node_modules/
aws lambda update-function-code --profile rotmanov@gmx.de --function-name $LAMBDA_NAME --zip-file fileb://$ZIP_FILE

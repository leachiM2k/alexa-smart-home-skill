#!/bin/bash
LAMBDA_NAME=433Remote
ZIP_FILE=$LAMBDA_NAME-dist.zip

rm -rf dist
mkdir dist
yarn install --prod --modules-folder dist/node_modules
cp -r *.js data dist/

rm -f $ZIP_FILE
cd dist
zip -X -r ../$ZIP_FILE .
cd -
aws lambda update-function-code --profile rotmanov@gmx.de --function-name $LAMBDA_NAME --zip-file fileb://$ZIP_FILE

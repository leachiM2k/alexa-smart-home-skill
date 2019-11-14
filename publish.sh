#!/bin/bash
LAMBDA_NAME=433Remote
ZIP_FILE=$LAMBDA_NAME-dist.zip

rm -rf dist
mkdir dist
cd dist
cp -r ../package.json ../package-lock.json ../*.js ../data .
yarn install --prod
# or: npm ci

rm -f ../$ZIP_FILE
zip -X -r ../$ZIP_FILE .
cd -
aws lambda update-function-code --profile rotmanov@gmx.de --function-name $LAMBDA_NAME --zip-file fileb://$ZIP_FILE

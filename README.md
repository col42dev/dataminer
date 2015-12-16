[Dataminer](https://github.com/col42dev/dataminer) handles data conversions from google spreadsheets to http://myjson.com.


## build & development

Update [NodeJS to version 4+](https://nodejs.org/en/download/)

The project uses TypeScript, so to get started you may have to run the following:

1-Install the TypeScript compiler: npm install -g typescript@^1.7.0

2-Run npm install and bower install

Steps 1-2 takes care of installing required tooling.

The final step is to start the TypeScript compiler to transpile your TypeScript code to JavaScript.

Use the following command to start watching your files:

>$ tsc --watch -m commonjs -t es5 --emitDecoratorMetadata --experimentalDecorators --jsx react dataminer-app.ts

To deploy:
>$ sh publishToEC2.sh

## references:

https://medium.com/@daviddentoom/how-to-build-an-angular-2-application-with-routing-and-services-67ead73db96e#.kf7ihgmyi

https://github.com/thelgevold/angular-2-samples/blob/master/index.html

https://auth0.com/blog/2015/10/15/angular-2-series-part-3-using-http/

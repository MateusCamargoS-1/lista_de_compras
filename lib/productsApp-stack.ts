import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';

import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';

export class ProductsAppStack extends cdk.Stack{
    readonly productsHandler: lambdaNodeJS.NodejsFunction;

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // criação da nossa tabela
        const productDdb  = new dynamodb.Table(this, 'ProductDdb', {
            tableName: 'products',
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            partitionKey: {
                name: 'id',
                type: dynamodb.AttributeType.STRING
            },
            billingMode: dynamodb.BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        });

        this.productsHandler = new lambdaNodeJS.NodejsFunction(this, 'ProductsFunction', {
            functionName: 'ProductsFunction',
            entry: 'lambda/ProductsFunction.ts',
            handler: 'handler',
            runtime: lambda.Runtime.NODEJS_16_X,
            memorySize: 256,
            timeout: cdk.Duration.seconds(5),
            bundling: {
                minify: true,
                sourceMap: false,
            },
            environment: {
                PRODUCTS_DDB: productDdb.tableName
            },
            tracing: lambda.Tracing.ACTIVE
        })

        productDdb.grantReadWriteData(this.productsHandler);

    }   
}
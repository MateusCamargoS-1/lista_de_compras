import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambdaNodeJS from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

interface ShoppingListApiStackProps extends cdk.StackProps {
    productHandler: lambdaNodeJS.NodejsFunction
}

export class ShoppingListApiStack extends cdk.Stack {
    
    constructor(scope:Construct, id: string, props: ShoppingListApiStackProps) {
        super(scope, id, props);

        const api = new apigateway.RestApi(this, 'shopping-list-api', {
            restApiName: 'Shopping List Service'
        });

        const productRequestValidator = new apigateway.RequestValidator(this, 'ProductRequestValdiator', {
            restApi: api,
            requestValidatorName: 'Product request validator',
            validateRequestBody: true
        });

        const productModel = new apigateway.Model(this, 'ProductModel', {
            modelName: 'ProductModel', 
            restApi: api,
            contentType: 'application/json',
            schema: {
                type: apigateway.JsonSchemaType.OBJECT,
                properties: {
                    productName: {
                        type: apigateway.JsonSchemaType.STRING
                    }, 
                    code: {
                        type: apigateway.JsonSchemaType.STRING
                    },
                    price: {
                        type: apigateway.JsonSchemaType.NUMBER
                    },
                    model: {
                        type: apigateway.JsonSchemaType.STRING
                    }
                },
                required: [
                    'productName',
                    'code'
                ]
            }
        })

        const productsIntegration = new apigateway.LambdaIntegration(props.productHandler);

        // recurso /products
        const productsResource = api.root.addResource('products');
        // GET /products
        productsResource.addMethod('GET', productsIntegration);
        // POST /products
        productsResource.addMethod('POST', productsIntegration, {
            requestValidator: productRequestValidator,
            requestModels: {
                "application/json": productModel
            }
        });

        // subrecurso /products/{id}
        const productIdResource = productsResource.addResource('{id}');
        // GET /products/{id}
        productIdResource.addMethod('GET', productsIntegration);
        // PUT /products/{id}
        productIdResource.addMethod('PUT', productsIntegration,{
            requestValidator: productRequestValidator,
            requestModels: {
                "application/json": productModel
            }
        });
        // DELETE /products/{id}
        productIdResource.addMethod('DELETE', productsIntegration);

    }
}
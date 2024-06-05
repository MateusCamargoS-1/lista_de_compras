import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuid } from 'uuid';
import * as AWSXRay from 'aws-xray-sdk';

// Instrumentando nossa função lambda
AWSXRay.captureAWS(require('aws-sdk'));

const productsDdb = process.env.PRODUCTS_DDB!
const ddbClient = new DynamoDB.DocumentClient();

interface Product {
    id: string;
    productName: string;
    code: string;
    price: number;
    model: string;
}

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {
    const method = event.httpMethod;
    const apiRequestId = event.requestContext.requestId;
    const lambdaRequestId = context.awsRequestId;

    console.log(`API Gateway ResquestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);

    if(event.resource === '/products') {
        //  /products
        if(method === 'GET') {
            // Buscar todos os produtos
            console.log('GET /products');
            const products = await getAllProducts();

            return {
                statusCode: 200,
                body: JSON.stringify(products)
            }
        } else if(method === 'POST') {
            // Criar um produto novo
            console.log('POST /products');
            const product = JSON.parse(event.body!) as Product;
            const productCreated = await create(product);
            
            return {
                statusCode: 201,
                body: JSON.stringify(productCreated)
            }
        }
    } else if(event.resource === '/products/{id}') {
        // /products/{id}

        const productId = event.pathParameters!.id!
    
        if(method === 'GET') {
            // Buscar produto pelo ID
            console.log(`GET /products/${productId}`);

            try {
                const product = await getProductById(productId);
                
                return {
                    statusCode: 201,
                    body: JSON.stringify(product)
                }
            } catch(err) {
                console.error((<Error>err).message);
                return {
                    statusCode: 404,
                    body: (<Error>err).message
                }
            }
        } else if(method === 'PUT') {
            // Alterar produto pelo ID
            console.log(`GET /products/${productId}`);

            try {
                const product = JSON.parse(event.body!) as Product;
                const productUpdated = await updateProduct(productId, product);
                return {
                    statusCode: 200,
                    body: JSON.stringify(productUpdated)
                }
            } catch(ConditionalCheckFailedException) {
                return {
                    statusCode: 404,
                    body: 'Product not found'
                }
            }

        } else if(method === 'DELETE') {
            // Apagar produto pelo ID
            console.log(`DELETE /products/${productId}`);

            try {
                const product = await deleteProduct(productId);
                return {
                    statusCode: 200,
                    body: JSON.stringify(product)
                }
            } catch(err) {
                console.error((<Error>err).message);
                return {
                    statusCode: 404,
                    body: (<Error>err).message
                }
            }

        }

    }

    return {
        statusCode: 400,
        headers: {},
        body: JSON.stringify({
            message: 'Bad request'
        })
    }
}

async function getAllProducts(): Promise<Product[]>  {
    const data = await ddbClient.scan({
        TableName: productsDdb
    }).promise();

    return data.Items as Product[];
}

async function  getProductById(productId: string): Promise<Product> {
    const data = await ddbClient.get({
        TableName: productsDdb,
        Key: {
            id: productId
        }
    }).promise();

    if(data.Item) {
        return data.Item as Product;
    } else {
        throw new Error('Product not found');
    }
}

async function create(product: Product):Promise<Product> {
    product.id = uuid();
    await ddbClient.put({
        TableName: productsDdb,
        Item: product
    }).promise()

    return product
}

async function deleteProduct(productId: string):Promise<Product> {
    const data = await ddbClient.delete({
        TableName: productsDdb,
        Key: {
            id: productId
        },
        ReturnValues: "ALL_OLD"
    }).promise();

    if(data.Attributes) {
        return data.Attributes as Product;
    } else {
        throw new Error('Product not found');
    }
}

async function updateProduct(productId: string, product: Product): Promise<Product> {
    const data = await ddbClient.update({
        TableName: productsDdb,
        Key: {
            id: productId
        },
        ConditionExpression: 'attribute_exists(id)',
        UpdateExpression: 'set productName = :n, code = :c, price = :p, model = :m',
        ExpressionAttributeValues: {
            ':n': product.productName,
            ':c': product.code,
            ':p': product.price,
            ':m': product.model
        },
        ReturnValues: 'UPDATED_NEW'
    }).promise();

    data.Attributes!.id = productId;
    return data.Attributes as Product;
}
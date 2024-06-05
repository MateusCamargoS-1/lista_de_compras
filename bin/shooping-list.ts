#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ProductsAppStack } from '../lib/productsApp-stack';
import { ShoppingListApiStack } from '../lib/shoppingListApi-stack';

const app = new cdk.App();

const env: cdk.Environment = {
  region: 'us-east-1',
  account: '211125441055'
}

const tags = {
  cost: 'ShoppingList',
  team: 'Mateus'
}
const productsAppStack = new ProductsAppStack(app, 'ProductsApp', {
  env: env,
  tags: tags
})

const shoppingListApiStack = new ShoppingListApiStack(app, 'Api', {
  env: env,
  tags: tags,
  productHandler: productsAppStack.productsHandler
})

shoppingListApiStack.addDependency(productsAppStack);
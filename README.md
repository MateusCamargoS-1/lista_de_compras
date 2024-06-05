# API Lista de Compras

Este é um projeto que implementa uma API para gerenciar uma lista de compras utilizando AWS Lambda, DynamoDB e API Gateway.

## Estrutura do Projeto

O projeto é dividido em diferentes arquivos TypeScript que realizam funções específicas:

- `shopping-list.ts`: Este arquivo é o ponto de entrada para o projeto. Ele configura as pilhas CDK e inicializa a aplicação.
- `productsFunction.ts`: Este arquivo contém a lógica da função Lambda que manipula os produtos na lista de compras.
- `productsApp-stacks.ts`: Este arquivo contém a definição da pilha CDK que cria a tabela DynamoDB e a função Lambda para manipular os produtos.
- `shoppinglistApi.ts`: Este arquivo contém a definição da pilha CDK que cria a API Gateway para expor a função Lambda e manipular as requisições HTTP.

## Pré-requisitos

- Node.js
- AWS CLI configurado com credenciais de acesso
- AWS CDK instalado globalmente (`npm install -g aws-cdk`)

## Instalação

1. Clone este repositório.
2. Instale as dependências do projeto: `npm install`.
3. Execute `cdk deploy` para implantar a infraestrutura na sua conta AWS.

## Uso

Após implantar a infraestrutura, você pode usar a API para gerenciar a lista de compras. A API possui os seguintes endpoints:

- `GET /products`: Retorna todos os produtos na lista de compras.
- `POST /products`: Adiciona um novo produto à lista de compras.
- `GET /products/{id}`: Retorna um produto específico pelo seu ID.
- `PUT /products/{id}`: Atualiza um produto existente na lista de compras.
- `DELETE /products/{id}`: Remove um produto da lista de compras.

Certifique-se de substituir `{id}` pelo ID real do produto ao fazer solicitações para os endpoints `GET`, `PUT` e `DELETE`.

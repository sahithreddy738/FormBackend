
export const products = {
    TableName: "products",
    KeySchema: [{ AttributeName: "email", KeyType: "HASH" }], 
    AttributeDefinitions: [
        { AttributeName: "email", AttributeType: "S" },
       

    ],
   
    ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1
    }
};



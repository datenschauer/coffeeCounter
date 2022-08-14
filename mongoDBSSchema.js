db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['firstname', 'lastname', 'email', 'passwordHash', 'passwordSalt', 'isAdmin'],
            properties: {
                firstname: {
                    bsonType: 'string',
                },
                lastname: {
                    bsonType: 'string',
                },
                email: {
                    bsonType: 'string',
                },
                passwordHash: {
                    bsonType: 'string',
                    description: 'a bcrypt hashed password',
                },
                passwordSalt: {
                    bsonType: 'string',
                    description: 'the salt for password en- and decryption',
                },
                lastLogin: {
                    bsonType: 'timestamp',
                    description: 'a timestamp, updated, whenever the user logs in',
                },
                isAdmin: {
                    bsonType: 'bool',
                    description: 'set if user is authorized and gets admin privileges',
                },
                balance: {
                    bsonType: 'int',
                    description: 'the current balance from drinking coffee in cents',
                },
                drinks: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                        required: ['date', 'cups', 'withMilk', 'amount'],
                        properties: {
                            date: {
                                bsonType: 'date',
                            },
                            cups: {
                                bsonType: 'int',
                                description: 'cups been drunk',
                            },
                            withMilk: {
                                bsonType: 'bool',
                                description: 'has coffee been with milk? then extra cents have to been added',
                            },
                            amount: {
                                bsonType: 'int',
                                description: 'the amount in cents for drunk cups',
                            }
                        }
                    }
                },
                payments: {
                    bsonType: 'array',
                    items: {
                        bsonType: 'object',
                    }
                }
            }
        }
    }
});
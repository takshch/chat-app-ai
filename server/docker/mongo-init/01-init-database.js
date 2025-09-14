// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the virallens database
db = db.getSiblingDB('virallens');

// Create a user for the application
db.createUser({
  user: 'app_user',
  pwd: 'app_password',
  roles: [
    {
      role: 'readWrite',
      db: 'virallens'
    }
  ]
});

// Create the users collection with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 6,
          description: 'Password must be at least 6 characters long'
        },
        name: {
          bsonType: 'string',
          minLength: 2,
          description: 'Name must be at least 2 characters long'
        },
        createdAt: {
          bsonType: 'date',
          description: 'Created date must be a valid date'
        },
        updatedAt: {
          bsonType: 'date',
          description: 'Updated date must be a valid date'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ createdAt: -1 });

print('Database initialized successfully!');
print('Created user: app_user');
print('Created database: virallens');
print('Created collection: users with validation');
print('Created indexes: email (unique), createdAt');

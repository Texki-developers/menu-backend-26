import * as mongoose from 'mongoose';

export const databaseProviders = [
  {
    provide: 'DATABASE_CONNECTION',
    useFactory: (): Promise<typeof mongoose> =>
      mongoose.connect('mongodb+srv://muhsin:6677889900@As@menudbcluster.kxm6ly6.mongodb.net/?appName=menudbcluster'),
  },
];

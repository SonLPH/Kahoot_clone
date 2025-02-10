import * as dotenv from 'dotenv';

export class ConfigService {
  private readonly envConfig: Record<string, string>;
  constructor() {
    const result = dotenv.config();

    if (result.error) {
      this.envConfig = process.env;
    } else {
      this.envConfig = result.parsed;
    }
  }

  public get(key: string): string {
    return this.envConfig[key];
  }

  public async getPortConfig() {
    return this.get('PORT');
  }

  public async getMongoConfig() {
    return {
      uri:
        'mongodb://' +
        this.get('MONGO_USER') +
        ':' +
        this.get('MONGO_PASSWORD') +
        '@' +
        this.get('MONGO_HOST'),
      dbName: this.get('MONGO_DATABASE'),
    };
  }

  public async getCorsConfig() {
    const allowedOrigins = this.get('ALLOWED_ORIGINS')
      .split(',')
      .map((item) => item.trim());
    const allowedMethods = this.get('ALLOWED_METHOD')
      .split(',')
      .map((item) => item.trim());

    return {
      origin: allowedOrigins,
      credentials: true,
      methods: allowedMethods,
      preflightContinue: false,
    };
  }
}

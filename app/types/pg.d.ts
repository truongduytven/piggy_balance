declare module 'pg' {
  export class Pool {
    constructor(config?: any);
    connect(): Promise<PoolClient>;
    query(text: string, values?: any[]): Promise<QueryResult<any>>;
    end(): Promise<void>;
  }

  export interface PoolClient {
    query(text: string, values?: any[]): Promise<QueryResult<any>>;
    release(err?: Error | boolean): void;
  }

  export interface QueryResult<T = any> {
    rows: T[];
    command: string;
    rowCount: number;
    oid: number;
    fields: any[];
  }
}

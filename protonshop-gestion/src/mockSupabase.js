import { mockProducts, mockCategories, mockOrders } from './mockData';

class MockSupabaseClient {
    constructor() {
        this.auth = {
            getUser: async () => ({ data: { user: { id: 'mock-user-id', email: 'admin@bodegachina.com' } }, error: null }),
            signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
            signOut: async () => ({ error: null }),
            onAuthStateChange: (callback) => {
                callback('SIGNED_IN', { user: { id: 'mock-user-id' } });
                return { data: { subscription: { unsubscribe: () => { } } } };
            }
        };
    }

    from(table) {
        return new QueryBuilder(table);
    }
}

class QueryBuilder {
    constructor(table) {
        this.table = table;
        this.data = this.getTableData(table);
        this.filters = [];
        this._select = '*';
    }

    getTableData(table) {
        switch (table) {
            case 'products': return [...mockProducts];
            case 'categories': return [...mockCategories];
            case 'orders': return [...mockOrders];
            default: return [];
        }
    }

    select(columns = '*') {
        this._select = columns;
        return this;
    }

    insert(record) {
        console.log(`[MockDB-Gestion] Insertando en ${this.table}:`, record);
        return { data: [record], error: null };
    }

    update(updates) {
        console.log(`[MockDB-Gestion] Actualizando en ${this.table}:`, updates);
        return this;
    }

    delete() {
        console.log(`[MockDB-Gestion] Eliminando en ${this.table}`);
        return this;
    }

    eq(column, value) {
        this.filters.push((row) => row[column] === value);
        return this;
    }

    gte(column, value) { return this; }
    lte(column, value) { return this; }
    order() { return this; }

    async then(resolve, reject) {
        let result = this.data;
        for (const filter of this.filters) {
            result = result.filter(filter);
        }
        resolve({ data: result, error: null });
    }
}

export const supabase = new MockSupabaseClient();

import { mockProducts, mockCategories, mockOrders } from './mockData';

class MockSupabaseClient {
    constructor() {
        this.auth = {
            getUser: async () => ({ data: { user: { id: 'mock-user-id', email: 'demo@bodegachina.com' } }, error: null }),
            signInWithPassword: async () => ({ data: { user: { id: 'mock-user-id' } }, error: null }),
            signOut: async () => ({ error: null }),
            getSession: async () => ({
                data: {
                    session: {
                        user: { id: 'mock-user-id', email: 'demo@bodegachina.com' },
                        access_token: 'mock-access-token'
                    }
                },
                error: null
            }),
            onAuthStateChange: (callback) => {
                // Simular sesión iniciada
                callback('SIGNED_IN', { user: { id: 'mock-user-id', email: 'demo@bodegachina.com' } });
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
        this.orders = [];
        this._select = '*'; // Default select all
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
        // Simular inserción
        console.log(`[MockDB] Insertando en ${this.table}:`, record);
        const newRecord = { ...record, id: Math.floor(Math.random() * 10000) };
        if (this.table === 'orders') mockOrders.push(newRecord); // Simple in-memory push (won't persist reload)
        return { data: [newRecord], error: null, select: () => ({ data: [newRecord], error: null }) };
    }

    update(updates) {
        console.log(`[MockDB] Actualizando en ${this.table}:`, updates);
        return this;
    }

    eq(column, value) {
        this.filters.push((row) => row[column] === value);
        return this;
    }

    gte(column, value) {
        this.filters.push((row) => row[column] >= value);
        return this;
    }

    lte(column, value) {
        this.filters.push((row) => row[column] <= value);
        return this;
    }

    order(column, { ascending = true } = {}) {
        this.orders.push({ column, ascending });
        return this;
    }

    async then(resolve, reject) {
        // Aplicar filtros
        let result = this.data;
        for (const filter of this.filters) {
            result = result.filter(filter);
        }

        // Aplicar ordenamiento (simple)
        if (this.orders.length > 0) {
            const { column, ascending } = this.orders[0];
            result.sort((a, b) => {
                if (a[column] < b[column]) return ascending ? -1 : 1;
                if (a[column] > b[column]) return ascending ? 1 : -1;
                return 0;
            });
        }

        resolve({ data: result, error: null });
    }
}

export const supabase = new MockSupabaseClient();

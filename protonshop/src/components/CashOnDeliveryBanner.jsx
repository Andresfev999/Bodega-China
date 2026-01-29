import React from 'react';
import { Truck } from 'lucide-react';

const CashOnDeliveryBanner = () => {
    return (
        <div style={{
            backgroundColor: 'var(--success)', // Using success color (green) for trust
            color: 'white',
            width: '100%',
            padding: '0.75rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontWeight: '600',
            fontSize: '0.9rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <Truck size={20} />
            <span>¡PAGO CONTRAENTREGA DISPONIBLE! Paga seguro al recibir tu pedido en casa. 🏠💵</span>
        </div>
    );
};

export default CashOnDeliveryBanner;

import React, { useState, useEffect } from 'react';
import { Truck, Package } from 'lucide-react';

const CashOnDeliveryBanner = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const messages = [
        {
            text: "🚀 ¡APROVECHA NUESTRAS OFERTAS! Envíos a todo el país 🇨🇴",
            color: 'linear-gradient(90deg, #ce1126 0%, #a30e1e 100%)' // Red
        },
        {
            text: "📦 ¡VENDEMOS AL POR MAYOR DESDE UNA UNIDAD! Precios de locura 🤯",
            color: 'linear-gradient(90deg, #fbc531 0%, #e1b12c 100%)', // Gold
            textColor: '#000' // Better contrast on gold
        }
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    const currentMessage = messages[currentIndex];

    return (
        <div style={{
            background: currentMessage.color,
            color: currentMessage.textColor || 'white',
            width: '100%',
            padding: '1.2rem',
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.8rem',
            fontWeight: '800',
            fontSize: '1.2rem',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.5s ease'
        }}>
            <div key={currentIndex} style={{ animation: 'fadeSlide 0.5s ease-out' }}>
                {currentMessage.text}
            </div>

            {/* Simple sheen effect */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '50%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                animation: 'sheen 3s infinite'
            }} />
            <style>{`
                @keyframes fadeSlide {
                    0% { opacity: 0; transform: translateY(10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes sheen {
                    0% { left: -100%; }
                    50% { left: 100%; }
                    100% { left: 100%; }
                }
            `}</style>
        </div>
    );
};

export default CashOnDeliveryBanner;

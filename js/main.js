// Main Logic for ProtonDev

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. Hero Canvas Animation (Network / Particles) ---
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');

    let w, h;
    let particles = [];

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * w;
            this.y = Math.random() * h;
            this.vx = (Math.random() - 0.5) * 1; // Slow speed
            this.vy = (Math.random() - 0.5) * 1;
            this.size = Math.random() * 2 + 1;
            this.color = Math.random() > 0.5 ? '#0052FF' : '#00F5FF'; // Blue or Cyan
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce
            if (this.x < 0 || this.x > w) this.vx *= -1;
            if (this.y < 0 || this.y > h) this.vy *= -1;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const count = Math.floor(w / 15); // Density based on width
        for (let i = 0; i < count; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);

        // Update and draw particles
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        ctx.strokeStyle = 'rgba(0, 82, 255, 0.15)'; // Faint blue lines

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => { resize(); initParticles(); });
    resize();
    initParticles();
    animate();


    // --- 2. Service Tabs logic ---
    const tabs = document.querySelectorAll('.tab-btn');
    const webServices = document.getElementById('web-services');
    const mobileServices = document.getElementById('mobile-services');

    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');

                if (tab.dataset.target === 'web') {
                    webServices.style.display = 'grid';
                    mobileServices.style.display = 'none';
                    webServices.classList.add('active');
                } else {
                    webServices.style.display = 'none';
                    mobileServices.style.display = 'grid';
                    mobileServices.classList.add('active');
                }
            });
        });
    }

    // --- 3. Service Detail Modal Logic ---
    const modal = document.getElementById('serviceModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.getElementById('closeModal');

    // Data definition for dynamic content
    const serviceDetails = {
        'landing': {
            title: "Landing Pages de Alto Impacto",
            desc: "Diseñamos páginas de aterrizaje focalizadas en una sola cosa: convertir visitantes en clientes. Optimizamos cada pixel para la persuasión.",
            tech: ["HTML5 Semántico", "CSS3 Animaciones", "JS para Interacciones"],
            process: ["Análisis de Buyer Persona", "Copywriting Persuasivo", "Diseño UX/UI", "Desarrollo & A/B Testing"]
        },
        'corporate': {
            title: "Sitios Web Corporativos",
            desc: "Tu oficina digital abierta 24/7. Transmitimos la identidad de tu marca con un diseño sobrio, elegante y tecnológicamente avanzado.",
            tech: ["React / Next.js", "CMS Headless", "SEO Técnico Avanzado"],
            process: ["Arquitectura de Información", "Diseño de Sistema", "Desarrollo Modular", "Integración de Contenido"]
        },
        'ecommerce': {
            title: "E-commerce & Tiendas Online",
            desc: "Vende al mundo sin límites. Plataformas robustas, seguras y fáciles de administrar.",
            tech: ["Shopify / WooCommerce / Custom", "Pasarelas de Pago (Stripe/PayPal)", "Gestión de Inventario"],
            process: ["Setup de Catálogo", "Configuración de Pagos", "Diseño de Checkout", "Seguridad SSL"]
        },
        'dashboard': {
            title: "Dashboards & Aplicaciones Web",
            desc: "Sistemas complejos simplificados. Visualiza datos, gestiona usuarios y automatiza procesos internos.",
            tech: ["React / Vue", "Node.js Backend", "PostgreSQL / Mongo", "WebSockets"],
            process: ["Modelado de Datos", "UX Research", "Desarrollo Frontend/Backend", "Testing Q/A"]
        },
        'ios': {
            title: "Desarrollo iOS Nativo",
            desc: "Aplicaciones premium para iPhone y iPad. Aprovecha al máximo el hardware de Apple con Swift.",
            tech: ["Swift 5", "SwiftUI", "CoreData", "ARKit"],
            process: ["Diseño Human Interface", "Desarrollo Nativo", "TestFlight", "App Store Release"]
        },
        'android': {
            title: "Desarrollo Android Nativo",
            desc: "Llega a millones de usuarios con apps robustas y performantes en el ecosistema Google.",
            tech: ["Kotlin", "Jetpack Compose", "Firebase", "Material Design 3"],
            process: ["Diseño Material", "Arquitectura MVP/MVVM", "Desarrollo", "Play Store Release"]
        },
        'hybrid': {
            title: "Desarrollo Multiplataforma",
            desc: "Lo mejor de dos mundos. Una sola base de código para iOS y Android, reduciendo costos y tiempos.",
            tech: ["Flutter / React Native", "Dart / JS", "Native Bridges"],
            process: ["Setup Multiplataforma", "Desarrollo UI/Logic", "Compilación Dual", "Deploy"]
        }
    };

    window.openService = (key) => {
        const data = serviceDetails[key];
        if (!data) return;

        let techHtml = data.tech.map(t => `<span style="background:rgba(0,82,255,0.2); padding:5px 10px; border-radius:4px; font-size:0.8rem; margin-right:5px; display:inline-block; margin-bottom:5px;">${t}</span>`).join('');
        let processHtml = data.process.map((step, i) => `<li style="margin-bottom:10px; color:#aaa;"><strong style="color:var(--color-primary)">${i + 1}.</strong> ${step}</li>`).join('');

        modalContent.innerHTML = `
            <h2 style="font-size:2rem; margin-bottom:15px;">${data.title}</h2>
            <p style="color:#ccc; font-size:1.1rem; line-height:1.7; margin-bottom:30px;">${data.desc}</p>
            
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:40px; margin-bottom:30px;" class="modal-grid">
                <div>
                    <h4 style="color:var(--color-accent); margin-bottom:15px; text-transform:uppercase;">Tecnologías</h4>
                    <div>${techHtml}</div>
                </div>
                <div>
                    <h4 style="color:var(--color-accent); margin-bottom:15px; text-transform:uppercase;">Proceso</h4>
                    <ul style="list-style:none;">${processHtml}</ul>
                </div>
            </div>
            
            <button class="btn btn-primary full-width" onclick="location.href='#contact'; document.getElementById('serviceModal').classList.remove('active');">Solicitar Cotización para esto</button>
        `;

        modal.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Mobile fix for grid
        if (window.innerWidth < 700) {
            document.querySelector('.modal-grid').style.gridTemplateColumns = '1fr';
        }
    };

    closeModal.addEventListener('click', () => {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    });

    window.onclick = (e) => {
        if (e.target == modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    };

});

/**
 * Main JavaScript file for Crepes & Waffles website
 * Contains shared functionality across pages
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile Navigation
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav-links');
    
    if (burger && nav) {
        burger.addEventListener('click', () => {
            // Toggle Active Class
            nav.classList.toggle('active');
            burger.classList.toggle('active');
        });
    }
    
    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.nav-links li a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav.classList.contains('active')) {
                nav.classList.remove('active');
                burger.classList.remove('active');
            }
        });
    });
    
    // Menu page filter functionality
    if (document.querySelector('.menu-nav-btn')) {
        const menuButtons = document.querySelectorAll('.menu-nav-btn');
        const menuItems = document.querySelectorAll('.menu-item');
        const menuCategories = document.querySelectorAll('.menu-category');
        
        menuButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Remove active class from all buttons
                menuButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                button.classList.add('active');
                
                // Get selected category
                const category = button.getAttribute('data-category');
                
                // Show/hide menu items based on category
                if (category === 'all') {
                    menuItems.forEach(item => item.style.display = 'block');
                    menuCategories.forEach(cat => cat.style.display = 'block');
                } else {
                    menuCategories.forEach(cat => {
                        if (cat.id === category) {
                            cat.style.display = 'block';
                        } else {
                            cat.style.display = 'none';
                        }
                    });
                }
            });
        });
    }
    
    // Date formatting
    window.formatDate = function(date) {
        const options = { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        return new Date(date).toLocaleDateString('es-CO', options);
    };
    
    // Time ago formatting
    window.timeAgo = function(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval > 1) {
            return `hace ${interval} años`;
        }
        
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return `hace ${interval} meses`;
        }
        
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return `hace ${interval} días`;
        }
        
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return `hace ${interval} horas`;
        }
        
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return `hace ${interval} minutos`;
        }
        
        return `hace ${Math.floor(seconds)} segundos`;
    };
    
    // Display notification
    window.showNotification = function(message, type = 'success', duration = 3000) {
        const notification = document.getElementById('notification-popup');
        const notificationMessage = document.getElementById('notification-message');
        const notificationIcon = document.querySelector('.notification-icon');
        
        if (notification && notificationMessage) {
            // Set message
            notificationMessage.textContent = message;
            
            // Set icon based on type
            if (notificationIcon) {
                notificationIcon.className = 'notification-icon fas';
                
                switch (type) {
                    case 'success':
                        notificationIcon.classList.add('fa-check-circle');
                        break;
                    case 'error':
                        notificationIcon.classList.add('fa-times-circle');
                        break;
                    case 'warning':
                        notificationIcon.classList.add('fa-exclamation-circle');
                        break;
                    case 'info':
                        notificationIcon.classList.add('fa-info-circle');
                        break;
                }
            }
            
            // Show notification
            notification.classList.add('show');
            
            // Hide after duration
            setTimeout(() => {
                notification.classList.remove('show');
            }, duration);
            
            // Add event listener to close button
            const closeBtn = document.getElementById('notification-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    notification.classList.remove('show');
                });
            }
        }
    };
    
    // Function to generate a random ID
    window.generateId = function() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };
    
    // Function to make API-like call to database.js
    window.apiCall = function(endpoint, data = {}) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    let response;
                    
                    switch (endpoint) {
                        case 'auth/login':
                            response = window.db.autenticarMesera(
                                data.usuario,
                                data.password,
                                data.zona
                            );
                            break;
                            
                        case 'mesas/zona':
                            response = window.db.obtenerMesasPorZona(data.zona);
                            break;
                            
                        case 'llamados/registrar':
                            response = window.db.registrarLlamado(data.mesa);
                            break;
                            
                        case 'llamados/aceptar':
                            response = window.db.aceptarLlamado(data.id, data.meseraId);
                            break;
                            
                        case 'llamados/postergar':
                            response = window.db.postergarLlamado(data.id, data.meseraId);
                            break;
                            
                        case 'llamados/mesera':
                            response = window.db.obtenerLlamadosPorMesera(data.meseraId);
                            break;
                            
                        case 'emparejamiento/cola':
                            response = window.db.obtenerColaEmparejamiento(data.zona);
                            break;
                            
                        case 'historial/mesera':
                            response = window.db.obtenerHistorialPorMesera(data.meseraId, data.fecha);
                            break;
                            
                        default:
                            throw new Error('Endpoint no válido');
                    }
                    
                    if (response && response.error) {
                        reject(response.error);
                    } else {
                        resolve(response);
                    }
                } catch (error) {
                    reject(error.message);
                }
            }, 500); // Simulación de latencia de red
        });
    };
});
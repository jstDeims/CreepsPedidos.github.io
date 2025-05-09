/**
 * JavaScript for the Mesera Page
 * Manages functionality for the waitress interface
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements - Login
    const loginContainer = document.getElementById('login-container');
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const zoneSelect = document.getElementById('zone-select');
    
    // DOM Elements - Dashboard
    const meseraDashboard = document.getElementById('mesera-dashboard');
    const meseraName = document.getElementById('mesera-name');
    const meseraZone = document.getElementById('mesera-zone');
    
    // DOM Elements - Panels
    const viewCallsBtn = document.getElementById('view-calls-btn');
    const viewTablesBtn = document.getElementById('view-tables-btn');
    const viewOrdersBtn = document.getElementById('view-orders-btn');
    const viewHistoryBtn = document.getElementById('view-history-btn');
    
    const callsPanel = document.getElementById('calls-panel');
    const tablesPanel = document.getElementById('tables-panel');
    const ordersPanel = document.getElementById('orders-panel');
    const historyPanel = document.getElementById('history-panel');
    
    // DOM Elements - Data Containers
    const callsList = document.getElementById('calls-list');
    const tablesMap = document.getElementById('map-container');
    const ordersList = document.getElementById('orders-list');
    const historyList = document.getElementById('history-list');
    const queueList = document.getElementById('queue-list');
    
    // DOM Elements - Call Notification
    const callNotification = document.getElementById('call-notification');
    const notificationTableNumber = document.getElementById('notification-table-number');
    const notificationZone = document.getElementById('notification-zone');
    const notificationTime = document.getElementById('notification-time');
    const acceptCallBtn = document.getElementById('accept-call-btn');
    const delayCallBtn = document.getElementById('delay-call-btn');
    
    // DOM Elements - Counters
    const callsBadge = document.getElementById('calls-badge');
    const ordersBadge = document.getElementById('orders-badge');
    
    // DOM Elements - Filters
    const tableFilters = document.querySelectorAll('.tables-filter .filter-btn');
    const historyDate = document.getElementById('history-date');
    const historyType = document.getElementById('history-type');
    const filterHistoryBtn = document.getElementById('filter-history-btn');
    
    // Session Storage Keys
    const MESERA_KEY = 'crepes_waffles_mesera';
    
    // Check for existing session
    checkSession();
    
    // Add event listeners
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Panel navigation
    [viewCallsBtn, viewTablesBtn, viewOrdersBtn, viewHistoryBtn].forEach(btn => {
        if (btn) {
            btn.addEventListener('click', () => switchPanel(btn.id));
        }
    });
    
    // Table filters
    tableFilters.forEach(filter => {
        filter.addEventListener('click', () => filterTables(filter.dataset.filter));
    });
    
    // History filter
    if (filterHistoryBtn) {
        filterHistoryBtn.addEventListener('click', filterHistory);
    }
    
    // Notification buttons
    if (acceptCallBtn) {
        acceptCallBtn.addEventListener('click', () => handleCallResponse('accept'));
    }
    
    if (delayCallBtn) {
        delayCallBtn.addEventListener('click', () => handleCallResponse('delay'));
    }
    
    /**
     * Check for existing session and load data
     */
    function checkSession() {
        const meseraData = sessionStorage.getItem(MESERA_KEY);
        
        if (meseraData) {
            const mesera = JSON.parse(meseraData);
            // Show dashboard
            showDashboard(mesera);
            
            // Start periodic data refresh
            startDataRefresh(mesera);
        }
    }
    
    /**
     * Handle login form submission
     */
    function handleLogin(event) {
        event.preventDefault();
        
        // Get form values
        const username = usernameInput.value;
        const password = passwordInput.value;
        const zone = zoneSelect.value;
        
        // Validate form
        if (!username || !password || !zone) {
            window.showNotification('Por favor, completa todos los campos', 'error');
            return;
        }
        
        // Make API call to authenticate
        window.apiCall('auth/login', {
            usuario: username,
            password: password,
            zona: zone
        })
            .then(response => {
                if (response) {
                    // Save mesera data to session
                    sessionStorage.setItem(MESERA_KEY, JSON.stringify(response));
                    
                    // Show dashboard
                    showDashboard(response);
                    
                    // Start data refresh
                    startDataRefresh(response);
                } else {
                    window.showNotification('Credenciales inválidas. Por favor, intenta de nuevo.', 'error');
                }
            })
            .catch(error => {
                window.showNotification(`Error: ${error}`, 'error');
            });
    }
    
    /**
     * Show the dashboard and hide login form
     */
    function showDashboard(mesera) {
        if (loginContainer && meseraDashboard) {
            loginContainer.classList.add('hidden');
            meseraDashboard.classList.remove('hidden');
            
            // Set mesera info
            if (meseraName) meseraName.textContent = mesera.nombre;
            if (meseraZone) meseraZone.textContent = mesera.zona;
            
            // Load initial data
            loadDashboardData(mesera);
        }
    }
    
    /**
     * Load dashboard data
     */
    function loadDashboardData(mesera) {
        // Load active calls
        loadCalls(mesera);
        
        // Load tables
        loadTables(mesera);
        
        // Load emparejamiento queue
        loadEmparejamientoQueue(mesera);
        
        // Load history
        loadHistory(mesera);
    }
    
    /**
     * Set up periodic data refresh
     */
    function startDataRefresh(mesera) {
        // Refresh every 10 seconds
        setInterval(() => {
            loadDashboardData(mesera);
        }, 10000);
    }
    
    /**
     * Load active calls
     */
    function loadCalls(mesera) {
        window.apiCall('llamados/mesera', { meseraId: mesera.id })
            .then(calls => {
                // Update calls badge
                if (callsBadge) {
                    callsBadge.textContent = calls.length;
                }
                
                // Show call notification if there are new calls
                if (calls.length > 0 && Math.random() > 0.7) {
                    // Show a notification for demonstration purposes
                    showCallNotification(calls[0]);
                }
                
                // Update calls list
                if (callsList) {
                    // Sort calls by priority and time
                    calls.sort((a, b) => {
                        // First by priority
                        const priorityOrder = { alta: 0, media: 1, baja: 2 };
                        const priorityDiff = priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
                        
                        if (priorityDiff !== 0) return priorityDiff;
                        
                        // Then by time (oldest first)
                        return new Date(a.tiempo) - new Date(b.tiempo);
                    });
                    
                    // Clear existing list
                    callsList.innerHTML = '';
                    
                    // Add call items
                    if (calls.length === 0) {
                        callsList.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-check-circle"></i>
                                <p>No hay llamados pendientes</p>
                            </div>
                        `;
                    } else {
                        calls.forEach(call => {
                            const callItem = document.createElement('div');
                            callItem.className = `call-item ${call.prioridad}`;
                            callItem.setAttribute('data-id', call.id);
                            
                            // Priority colors
                            let priorityColor;
                            switch (call.prioridad) {
                                case 'alta':
                                    priorityColor = 'var(--danger-color)';
                                    break;
                                case 'media':
                                    priorityColor = 'var(--warning-color)';
                                    break;
                                case 'baja':
                                    priorityColor = 'var(--success-color)';
                                    break;
                            }
                            
                            callItem.innerHTML = `
                                <div class="call-info">
                                    <div class="call-icon">
                                        <i class="fas fa-bell"></i>
                                    </div>
                                    <div class="call-details">
                                        <h3>Mesa ${call.mesa} - Zona ${call.zona}</h3>
                                        <p>Prioridad: <span style="color: ${priorityColor}; font-weight: 600;">${call.prioridad.toUpperCase()}</span></p>
                                        <p>Tiempo de espera: ${window.timeAgo(call.tiempo)}</p>
                                    </div>
                                </div>
                                <div class="call-actions">
                                    <button class="btn btn-small btn-accept accept-call-btn" data-id="${call.id}">
                                        <i class="fas fa-check"></i> Aceptar
                                    </button>
                                    <button class="btn btn-small btn-delay delay-call-btn" data-id="${call.id}">
                                        <i class="fas fa-clock"></i> Postergar
                                    </button>
                                </div>
                            `;
                            
                            callsList.appendChild(callItem);
                            
                            // Add event listeners to buttons
                            const acceptBtn = callItem.querySelector('.accept-call-btn');
                            const delayBtn = callItem.querySelector('.delay-call-btn');
                            
                            if (acceptBtn) {
                                acceptBtn.addEventListener('click', () => {
                                    acceptCall(call.id, mesera.id);
                                });
                            }
                            
                            if (delayBtn) {
                                delayBtn.addEventListener('click', () => {
                                    delayCall(call.id, mesera.id);
                                });
                            }
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error al cargar llamados:', error);
            });
    }
    
    /**
     * Load tables for the mesera's zone
     */
    function loadTables(mesera) {
        window.apiCall('mesas/zona', { zona: mesera.zona })
            .then(tables => {
                if (tablesMap) {
                    // Clear existing map
                    tablesMap.innerHTML = '';
                    
                    // Add table items
                    tables.forEach(table => {
                        const tableItem = document.createElement('div');
                        tableItem.className = `table-item ${table.estado}`;
                        tableItem.setAttribute('data-id', table.id);
                        tableItem.setAttribute('data-filter', table.estado);
                        
                        // Status text and class
                        let statusText, statusClass;
                        switch (table.estado) {
                            case 'disponible':
                                statusText = 'Disponible';
                                statusClass = 'status-available';
                                break;
                            case 'ocupada':
                                statusText = 'Ocupada';
                                statusClass = 'status-occupied';
                                break;
                            case 'pendiente':
                                statusText = 'Atención pendiente';
                                statusClass = 'status-pending';
                                break;
                            default:
                                statusText = 'Indefinido';
                                statusClass = '';
                        }
                        
                        tableItem.innerHTML = `
                            <div class="table-number">${table.numero}</div>
                            <div class="table-status ${statusClass}">${statusText}</div>
                        `;
                        
                        tablesMap.appendChild(tableItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error al cargar mesas:', error);
            });
    }
    
    /**
     * Load emparejamiento queue for the mesera's zone
     */
    function loadEmparejamientoQueue(mesera) {
        window.apiCall('emparejamiento/cola', { zona: mesera.zona })
            .then(queue => {
                if (queueList) {
                    // Clear existing queue
                    queueList.innerHTML = '';
                    
                    // If queue is empty
                    if (queue.length === 0) {
                        queueList.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-check-circle"></i>
                                <p>No hay mesas en la cola de emparejamiento</p>
                            </div>
                        `;
                        return;
                    }
                    
                    // Sort by priority and waiting time
                    queue.sort((a, b) => {
                        // First by status (pendiente first)
                        if (a.estado === 'pendiente' && b.estado !== 'pendiente') return -1;
                        if (a.estado !== 'pendiente' && b.estado === 'pendiente') return 1;
                        
                        // Then by priority
                        const priorityOrder = { alta: 0, media: 1, baja: 2 };
                        const priorityDiff = priorityOrder[a.prioridad] - priorityOrder[b.prioridad];
                        
                        if (priorityDiff !== 0) return priorityDiff;
                        
                        // Then by waiting time (longest first)
                        return b.tiempoEspera - a.tiempoEspera;
                    });
                    
                    // Add queue items
                    queue.forEach(item => {
                        const queueItem = document.createElement('div');
                        queueItem.className = `queue-item`;
                        
                        // Status text and class
                        let statusText, statusClass;
                        switch (item.estado) {
                            case 'ocupada':
                                statusText = 'Ocupada';
                                statusClass = '';
                                break;
                            case 'pendiente':
                                statusText = 'Pendiente';
                                statusClass = 'pending';
                                break;
                            default:
                                statusText = item.estado;
                                statusClass = '';
                        }
                        
                        queueItem.innerHTML = `
                            <div class="queue-table">${item.mesa}</div>
                            <div class="queue-waiting-time">
                                Tiempo de espera: ${item.tiempoEspera} min
                            </div>
                            <span class="queue-status ${statusClass}">${statusText}</span>
                        `;
                        
                        queueList.appendChild(queueItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error al cargar cola de emparejamiento:', error);
            });
    }
    
    /**
     * Load history for the mesera
     */
    function loadHistory(mesera) {
        // Get current date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];
        
        // Set default date if not already set
        if (historyDate && !historyDate.value) {
            historyDate.value = today;
        }
        
        // Get filter values
        const date = historyDate ? historyDate.value : today;
        const type = historyType ? historyType.value : 'all';
        
        window.apiCall('historial/mesera', { 
            meseraId: mesera.id,
            fecha: date
        })
            .then(history => {
                if (historyList) {
                    // Apply type filter if needed
                    if (type !== 'all') {
                        history = history.filter(item => item.tipo === type);
                    }
                    
                    // Clear existing history
                    historyList.innerHTML = '';
                    
                    // If history is empty
                    if (history.length === 0) {
                        historyList.innerHTML = `
                            <div class="empty-state">
                                <i class="fas fa-history"></i>
                                <p>No hay registros en el historial para esta fecha</p>
                            </div>
                        `;
                        return;
                    }
                    
                    // Add history items
                    history.forEach(item => {
                        const historyItem = document.createElement('div');
                        historyItem.className = 'history-item';
                        
                        // Format action text
                        let actionText;
                        switch (item.accion) {
                            case 'creacion':
                                actionText = 'Llamado creado';
                                break;
                            case 'aceptacion':
                                actionText = 'Llamado aceptado';
                                break;
                            case 'postergacion':
                                actionText = 'Llamado postergado';
                                break;
                            default:
                                actionText = item.accion;
                        }
                        
                        historyItem.innerHTML = `
                            <div class="history-info">
                                <div class="history-time">${window.formatDate(item.tiempo)}</div>
                                <div class="history-action">Mesa ${item.mesa} - ${actionText}</div>
                            </div>
                        `;
                        
                        historyList.appendChild(historyItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error al cargar historial:', error);
            });
    }
    
    /**
     * Show call notification
     */
    function showCallNotification(call) {
        if (callNotification && notificationTableNumber && notificationZone && notificationTime) {
            // Set notification data
            notificationTableNumber.textContent = call.mesa;
            notificationZone.textContent = call.zona;
            notificationTime.textContent = '0';
            
            // Add data attributes for response buttons
            if (acceptCallBtn) acceptCallBtn.setAttribute('data-id', call.id);
            if (delayCallBtn) delayCallBtn.setAttribute('data-id', call.id);
            
            // Show notification
            callNotification.classList.add('show');
            
            // Start updating time ago
            let seconds = 0;
            const timeInterval = setInterval(() => {
                seconds++;
                notificationTime.textContent = seconds;
                
                // Auto-hide after 60 seconds if not handled
                if (seconds >= 60) {
                    clearInterval(timeInterval);
                    callNotification.classList.remove('show');
                }
            }, 1000);
            
            // Store interval ID for cleanup
            callNotification.dataset.timeInterval = timeInterval;
        }
    }
    
    /**
     * Handle call notification response
     */
    function handleCallResponse(action) {
        if (callNotification) {
            // Get call ID
            const callId = action === 'accept' 
                ? acceptCallBtn.getAttribute('data-id')
                : delayCallBtn.getAttribute('data-id');
            
            // Get mesera data
            const mesera = JSON.parse(sessionStorage.getItem(MESERA_KEY));
            
            // Clear time interval
            clearInterval(parseInt(callNotification.dataset.timeInterval));
            
            // Hide notification
            callNotification.classList.remove('show');
            
            // Handle action
            if (action === 'accept') {
                acceptCall(callId, mesera.id);
            } else {
                delayCall(callId, mesera.id);
            }
        }
    }
    
    /**
     * Accept a call
     */
    function acceptCall(callId, meseraId) {
        window.apiCall('llamados/aceptar', { id: callId, meseraId })
            .then(response => {
                window.showNotification(`Has aceptado atender la mesa ${response.mesa}`);
                
                // Refresh data
                const mesera = JSON.parse(sessionStorage.getItem(MESERA_KEY));
                loadDashboardData(mesera);
            })
            .catch(error => {
                window.showNotification(`Error: ${error}`, 'error');
            });
    }
    
    /**
     * Delay a call
     */
    function delayCall(callId, meseraId) {
        window.apiCall('llamados/postergar', { id: callId, meseraId })
            .then(response => {
                window.showNotification(`Has postergado la atención de la mesa ${response.mesa}`);
                
                // Refresh data
                const mesera = JSON.parse(sessionStorage.getItem(MESERA_KEY));
                loadDashboardData(mesera);
            })
            .catch(error => {
                window.showNotification(`Error: ${error}`, 'error');
            });
    }
    
    /**
     * Switch between dashboard panels
     */
    function switchPanel(buttonId) {
        // Hide all panels
        [callsPanel, tablesPanel, ordersPanel, historyPanel].forEach(panel => {
            if (panel) panel.classList.remove('active-panel');
        });
        
        // Remove active class from all buttons
        [viewCallsBtn, viewTablesBtn, viewOrdersBtn, viewHistoryBtn].forEach(btn => {
            if (btn) btn.classList.remove('active');
        });
        
        // Show the selected panel
        switch (buttonId) {
            case 'view-calls-btn':
                if (callsPanel) callsPanel.classList.add('active-panel');
                if (viewCallsBtn) viewCallsBtn.classList.add('active');
                break;
            case 'view-tables-btn':
                if (tablesPanel) tablesPanel.classList.add('active-panel');
                if (viewTablesBtn) viewTablesBtn.classList.add('active');
                break;
            case 'view-orders-btn':
                if (ordersPanel) ordersPanel.classList.add('active-panel');
                if (viewOrdersBtn) viewOrdersBtn.classList.add('active');
                break;
            case 'view-history-btn':
                if (historyPanel) historyPanel.classList.add('active-panel');
                if (viewHistoryBtn) viewHistoryBtn.classList.add('active');
                break;
        }
    }
    
    /**
     * Filter tables by status
     */
    function filterTables(filter) {
        // Update active filter button
        tableFilters.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === filter) {
                btn.classList.add('active');
            }
        });
        
        // Filter table items
        const tableItems = document.querySelectorAll('.table-item');
        tableItems.forEach(item => {
            if (filter === 'all' || item.dataset.filter === filter) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }
    
    /**
     * Filter history by date and type
     */
    function filterHistory() {
        const mesera = JSON.parse(sessionStorage.getItem(MESERA_KEY));
        loadHistory(mesera);
    }
});
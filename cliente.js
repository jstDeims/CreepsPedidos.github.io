/**
 * JavaScript for the Cliente Page
 * Manages client-side functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const callWaiterBtn = document.getElementById('call-waiter-btn');
    const tableNumberInput = document.getElementById('table-number');
    const callStatus = document.getElementById('call-status');
    const statusIcon = document.getElementById('status-icon');
    const statusMessage = document.getElementById('status-message');
    const trackingContainer = document.getElementById('tracking-container');
    const waiterName = document.getElementById('waiter-name');
    
    // Session Storage Keys
    const TABLE_KEY = 'crepes_waffles_table';
    const CALL_KEY = 'crepes_waffles_call';
    const TRACKING_KEY = 'crepes_waffles_tracking';
    
    // Check for existing session
    initializeSession();
    
    // Add event listener to call button
    if (callWaiterBtn && tableNumberInput) {
        callWaiterBtn.addEventListener('click', callWaiter);
    }
    
    /**
     * Initialize the session based on stored data
     */
    function initializeSession() {
        // Check if we have an active table
        const tableNumber = sessionStorage.getItem(TABLE_KEY);
        if (tableNumber && tableNumberInput) {
            tableNumberInput.value = tableNumber;
        }
        
        // Check if we have an active call
        const callData = sessionStorage.getItem(CALL_KEY);
        if (callData) {
            const call = JSON.parse(callData);
            showCallStatus(call.message, call.status);
        }
        
        // Check if we have active tracking
        const trackingData = sessionStorage.getItem(TRACKING_KEY);
        if (trackingData && trackingContainer) {
            const tracking = JSON.parse(trackingData);
            trackingContainer.classList.remove('hidden');
            
            // Update waiter name
            if (waiterName) {
                waiterName.textContent = tracking.mesera;
            }
            
            // Update tracking stage
            updateTrackingStage(tracking.stage);
        }
    }
    
    /**
     * Handle call to waiter
     */
    function callWaiter() {
        // Validate table number
        if (!tableNumberInput.value) {
            showCallStatus('Por favor, ingresa el número de mesa', 'error');
            return;
        }
        
        const tableNumber = parseInt(tableNumberInput.value);
        if (isNaN(tableNumber) || tableNumber < 1 || tableNumber > 100) {
            showCallStatus('Por favor, ingresa un número de mesa válido (1-100)', 'error');
            return;
        }
        
        // Show loading state
        showCallStatus('Enviando llamado...', 'loading');
        
        // Save table number
        sessionStorage.setItem(TABLE_KEY, tableNumber);
        
        // Make API call to register the call
        window.apiCall('llamados/registrar', { mesa: tableNumber })
            .then(response => {
                // Success - show confirmation
                showCallStatus('¡Llamado enviado con éxito!', 'success');
                
                // Save call data
                sessionStorage.setItem(CALL_KEY, JSON.stringify({
                    id: response.id,
                    mesa: response.mesa,
                    message: '¡Llamado enviado con éxito!',
                    status: 'success'
                }));
                
                // Show notification
                window.showNotification(`Tu llamado ha sido enviado. La mesera ${response.mesera} te atenderá pronto.`);
                
                // Start tracking
                startTracking(response);
            })
            .catch(error => {
                // Error - show error message
                showCallStatus(`Error: ${error}`, 'error');
            });
    }
    
    /**
     * Update call status display
     */
    function showCallStatus(message, status) {
        if (callStatus && statusIcon && statusMessage) {
            // Remove hidden class
            callStatus.classList.remove('status-hidden');
            
            // Update message
            statusMessage.textContent = message;
            
            // Update icon based on status
            statusIcon.innerHTML = '';
            
            const icon = document.createElement('i');
            icon.className = 'fas';
            
            switch (status) {
                case 'loading':
                    icon.classList.add('fa-spinner', 'fa-spin');
                    break;
                case 'success':
                    icon.classList.add('fa-check-circle');
                    statusIcon.style.color = 'var(--success-color)';
                    break;
                case 'error':
                    icon.classList.add('fa-times-circle');
                    statusIcon.style.color = 'var(--danger-color)';
                    break;
                default:
                    icon.classList.add('fa-info-circle');
                    statusIcon.style.color = 'var(--primary-color)';
            }
            
            statusIcon.appendChild(icon);
        }
    }
    
    /**
     * Start tracking the order
     */
    function startTracking(response) {
        if (trackingContainer) {
            // Show tracking container
            trackingContainer.classList.remove('hidden');
            
            // Set initial stage
            updateTrackingStage('received');
            
            // Update waiter name
            if (waiterName) {
                waiterName.textContent = response.mesera;
            }
            
            // Save tracking data
            sessionStorage.setItem(TRACKING_KEY, JSON.stringify({
                id: response.id,
                mesa: response.mesa,
                mesera: response.mesera,
                stage: 'received'
            }));
            
            // Simulate order progress for demo purposes
            simulateOrderProgress();
        }
    }
    
    /**
     * Update the tracking stage visually
     */
    function updateTrackingStage(stage) {
        // Reset all stages
        document.querySelectorAll('.tracking-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Activate current and previous stages
        const stages = ['received', 'preparation', 'delivery', 'served'];
        const currentIndex = stages.indexOf(stage);
        
        for (let i = 0; i <= currentIndex; i++) {
            document.getElementById(`step-${stages[i]}`)?.classList.add('active');
        }
    }
    
    /**
     * Simulate order progress for demo
     */
    function simulateOrderProgress() {
        // Demo only: simulate the stages of the order
        // In a real app, this would be driven by server updates
        
        // Get current tracking data
        const trackingData = JSON.parse(sessionStorage.getItem(TRACKING_KEY) || '{}');
        
        // Stages and timing (in seconds)
        const stages = [
            { name: 'preparation', delay: 10, message: 'Tu pedido está en preparación' },
            { name: 'delivery', delay: 15, message: 'Tu pedido está en camino a tu mesa' },
            { name: 'served', delay: 20, message: '¡Tu pedido ha sido servido!' }
        ];
        
        // Schedule each stage
        stages.forEach((stage, index) => {
            setTimeout(() => {
                // Update stage
                updateTrackingStage(stage.name);
                
                // Update tracking data
                trackingData.stage = stage.name;
                sessionStorage.setItem(TRACKING_KEY, JSON.stringify(trackingData));
                
                // Show notification
                window.showNotification(stage.message);
                
                // If last stage, show option to request bill
                if (index === stages.length - 1) {
                    document.getElementById('bill-section')?.classList.remove('hidden');
                }
            }, stage.delay * 1000);
        });
    }
});
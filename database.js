/**
 * Database simulation for Crepes & Waffles
 * This file contains mock data and functions to simulate a database
 */

// Simulación de base de datos
const database = {
    // Meseras disponibles
    meseras: [
        {
            id: 1,
            nombre: "Ana Gómez",
            usuario: "ana",
            password: "12345",
            zona: "A",
            estado: "activo",
            mesas_asignadas: [1, 2, 3, 4, 5]
        },
        {
            id: 2,
            nombre: "María López",
            usuario: "maria",
            password: "12345",
            zona: "B",
            estado: "activo",
            mesas_asignadas: [6, 7, 8, 9, 10]
        },
        {
            id: 3,
            nombre: "Lucía Pérez",
            usuario: "lucia",
            password: "12345",
            zona: "C",
            estado: "activo",
            mesas_asignadas: [11, 12, 13, 14, 15]
        },
        {
            id: 4,
            nombre: "Camila Torres",
            usuario: "camila",
            password: "12345",
            zona: "D",
            estado: "activo",
            mesas_asignadas: [16, 17, 18, 19, 20]
        }
    ],
    
    // Mesas del restaurante
    mesas: [],
    
    // Llamados activos
    llamados: [],
    
    // Pedidos activos
    pedidos: [],
    
    // Historial de acciones
    historial: []
};

// Inicialización de mesas
function inicializarMesas() {
    database.mesas = [];
    
    // Generar 20 mesas
    for (let i = 1; i <= 20; i++) {
        // Determinar la zona basada en el número de mesa
        let zona;
        if (i <= 5) zona = "A";
        else if (i <= 10) zona = "B";
        else if (i <= 15) zona = "C";
        else zona = "D";
        
        // Estado inicial aleatorio (para demo)
        let estados = ["disponible", "ocupada", "pendiente"];
        let estado = Math.random() > 0.7 ? estados[Math.floor(Math.random() * estados.length)] : "disponible";
        
        // Crear objeto mesa
        database.mesas.push({
            id: i,
            numero: i,
            zona: zona,
            estado: estado,
            ocupacion: estado === "ocupada" ? Math.floor(Math.random() * 4) + 1 : 0,
            tiempo_ocupacion: estado === "ocupada" ? Math.floor(Math.random() * 60) : 0
        });
    }
}

// Inicializar base de datos al cargar
inicializarMesas();

// Función para autenticar mesera
function autenticarMesera(usuario, password, zona) {
    return database.meseras.find(mesera => 
        mesera.usuario === usuario && 
        mesera.password === password &&
        mesera.zona === zona
    );
}

// Función para obtener mesera por ID
function obtenerMeseraPorId(id) {
    return database.meseras.find(mesera => mesera.id === id);
}

// Función para obtener mesera por zona
function obtenerMeseraPorZona(zona) {
    return database.meseras.find(mesera => mesera.zona === zona);
}

// Función para obtener mesa por número
function obtenerMesaPorNumero(numero) {
    return database.mesas.find(mesa => mesa.numero === parseInt(numero));
}

// Función para registrar un llamado
function registrarLlamado(numeroMesa) {
    const mesa = obtenerMesaPorNumero(numeroMesa);
    
    if (!mesa) {
        return { error: "Mesa no encontrada" };
    }
    
    // Buscar la mesera asignada a la zona
    const mesera = obtenerMeseraPorZona(mesa.zona);
    
    if (!mesera) {
        return { error: "No hay mesera asignada a esta zona" };
    }
    
    // Actualizar estado de la mesa
    mesa.estado = "pendiente";
    
    // Generar ID único
    const idLlamado = Date.now();
    
    // Crear objeto llamado
    const nuevoLlamado = {
        id: idLlamado,
        mesa: mesa.numero,
        zona: mesa.zona,
        mesera_id: mesera.id,
        estado: "pendiente",
        tiempo: new Date(),
        prioridad: "media"
    };
    
    // Agregar llamado a la base de datos
    database.llamados.push(nuevoLlamado);
    
    // Registrar en historial
    registrarHistorial({
        tipo: "llamado",
        accion: "creacion",
        mesa: mesa.numero,
        zona: mesa.zona,
        mesera_id: mesera.id,
        tiempo: new Date()
    });
    
    // Retornar información del llamado
    return {
        id: idLlamado,
        mesa: mesa.numero,
        zona: mesa.zona,
        mesera: mesera.nombre
    };
}

// Función para aceptar un llamado
function aceptarLlamado(idLlamado, meseraId) {
    const llamado = database.llamados.find(llamado => llamado.id === idLlamado);
    
    if (!llamado) {
        return { error: "Llamado no encontrado" };
    }
    
    // Verificar que la mesera asignada sea la que acepta
    if (llamado.mesera_id !== meseraId) {
        return { error: "No tienes permisos para aceptar este llamado" };
    }
    
    // Actualizar estado del llamado
    llamado.estado = "aceptado";
    
    // Actualizar estado de la mesa
    const mesa = obtenerMesaPorNumero(llamado.mesa);
    if (mesa) {
        mesa.estado = "ocupada";
    }
    
    // Registrar en historial
    registrarHistorial({
        tipo: "llamado",
        accion: "aceptacion",
        mesa: llamado.mesa,
        zona: llamado.zona,
        mesera_id: meseraId,
        tiempo: new Date()
    });
    
    // Retornar información actualizada
    return {
        id: llamado.id,
        mesa: llamado.mesa,
        estado: llamado.estado,
        mesera: obtenerMeseraPorId(meseraId).nombre
    };
}

// Función para postergar un llamado
function postergarLlamado(idLlamado, meseraId) {
    const llamado = database.llamados.find(llamado => llamado.id === idLlamado);
    
    if (!llamado) {
        return { error: "Llamado no encontrado" };
    }
    
    // Verificar que la mesera asignada sea la que posterga
    if (llamado.mesera_id !== meseraId) {
        return { error: "No tienes permisos para postergar este llamado" };
    }
    
    // Actualizar prioridad del llamado
    llamado.prioridad = "baja";
    
    // Registrar en historial
    registrarHistorial({
        tipo: "llamado",
        accion: "postergacion",
        mesa: llamado.mesa,
        zona: llamado.zona,
        mesera_id: meseraId,
        tiempo: new Date()
    });
    
    // Retornar información actualizada
    return {
        id: llamado.id,
        mesa: llamado.mesa,
        prioridad: llamado.prioridad,
        mesera: obtenerMeseraPorId(meseraId).nombre
    };
}

// Función para registrar historial
function registrarHistorial(datos) {
    const nuevaEntrada = {
        id: Date.now(),
        ...datos
    };
    
    database.historial.push(nuevaEntrada);
    return nuevaEntrada;
}

// Función para obtener llamados de una mesera
function obtenerLlamadosPorMesera(meseraId) {
    return database.llamados.filter(llamado => 
        llamado.mesera_id === meseraId && 
        llamado.estado === "pendiente"
    );
}

// Función para obtener mesas por zona
function obtenerMesasPorZona(zona) {
    return database.mesas.filter(mesa => mesa.zona === zona);
}

// Función para obtener cola de emparejamiento por zona
function obtenerColaEmparejamiento(zona) {
    return database.mesas
        .filter(mesa => mesa.zona === zona && mesa.estado !== "disponible")
        .map(mesa => {
            // Buscar llamados asociados a esta mesa
            const llamadosAsociados = database.llamados.filter(
                llamado => llamado.mesa === mesa.numero
            );
            
            // Encontrar el llamado más reciente
            const llamadoReciente = llamadosAsociados.length > 0 
                ? llamadosAsociados.sort((a, b) => new Date(b.tiempo) - new Date(a.tiempo))[0]
                : null;
            
            // Calcular tiempo de espera (en minutos)
            let tiempoEspera = 0;
            if (llamadoReciente) {
                const tiempoTranscurrido = new Date() - new Date(llamadoReciente.tiempo);
                tiempoEspera = Math.floor(tiempoTranscurrido / (1000 * 60));
            }
            
            return {
                mesa: mesa.numero,
                zona: mesa.zona,
                estado: mesa.estado,
                ocupacion: mesa.ocupacion,
                tiempoEspera: tiempoEspera,
                prioridad: llamadoReciente ? llamadoReciente.prioridad : "media"
            };
        });
}

// Función para obtener historial por mesera
function obtenerHistorialPorMesera(meseraId, fecha = null) {
    let historial = database.historial.filter(entrada => entrada.mesera_id === meseraId);
    
    // Filtrar por fecha si se proporciona
    if (fecha) {
        const fechaFiltro = new Date(fecha);
        historial = historial.filter(entrada => {
            const fechaEntrada = new Date(entrada.tiempo);
            return fechaEntrada.toDateString() === fechaFiltro.toDateString();
        });
    }
    
    return historial.sort((a, b) => new Date(b.tiempo) - new Date(a.tiempo));
}

// Exportar funciones
window.db = {
    autenticarMesera,
    obtenerMeseraPorId,
    obtenerMeseraPorZona,
    obtenerMesaPorNumero,
    registrarLlamado,
    aceptarLlamado,
    postergarLlamado,
    obtenerLlamadosPorMesera,
    obtenerMesasPorZona,
    obtenerColaEmparejamiento,
    obtenerHistorialPorMesera
};
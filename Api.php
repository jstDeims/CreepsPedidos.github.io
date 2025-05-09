<?php
// Encabezado para indicar que respondemos con JSON
header('Content-Type: application/json');

// Configuración de conexión a MySQL (rellena con tus datos reales)
$host = "b77zt7a3oapin2nztlmb-mysql.services.clever-cloud.com";
$db = "b77zt7a3oapin2nztlmb";
$user = "u9h7yuqalayyxb05";
$password = "3m6CpbtiB2MONCZ0Bfok";
$port = 3306;

// Crear conexión
$conn = new mysqli($host, $user, $password, $db, $port);

// Verificar conexión
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión: " . $conn->connect_error]);
    exit();
}

// Validar parámetro GET
$tabla = $_GET['tabla'] ?? '';

$permitidas = ['mesas', 'zonas', 'meseras'];

if (!in_array($tabla, $permitidas)) {
    http_response_code(400);
    echo json_encode(["error" => "Tabla no permitida"]);
    exit();
}

// Hacer consulta
$sql = "SELECT * FROM `$tabla`";
$result = $conn->query($sql);

if (!$result) {
    http_response_code(500);
    echo json_encode(["error" => "Error en la consulta: " . $conn->error]);
    exit();
}

// Procesar resultados
$datos = [];
while ($fila = $result->fetch_assoc()) {
    $datos[] = $fila;
}

// Enviar respuesta
echo json_encode($datos);

// Cerrar conexión
$conn->close();
?>

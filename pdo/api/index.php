<?php
include "./get.php";
include "./post.php";
include "../config/database.php";

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: *');
header('Access-Control-Allow-Headers: *');

// Centralized CORS handling for OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    header('Access-Control-Allow-Methods: *');
    header('Access-Control-Allow-Headers: *');
    exit;
}

$con = new Connection();
$pdo = $con->connect();

$get = new Get($pdo);
$post = new Post($pdo);



//echo $_REQUEST['request'];
if (isset($_REQUEST['request']))
    $request = explode('/', $_REQUEST['request']);
else {
    http_response_code(404);
}


switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        switch ($request[0]) {
            case 'get_users':
                if (count($request) > 1) {
                    echo json_encode($get->get_users($request[1]));
                } else {
                    echo json_encode($get->get_users());
                }
                break;
            case 'get_active_users':
                if (count($request) > 1) {
                    echo json_encode($get->get_active_users($request[1]));
                } else {
                    echo json_encode($get->get_active_users());
                }
                break;
            case 'get_chatter_message':
                if (count($request) > 1) {
                    echo json_encode($get->get_chatter_message($request[1]));
                } else {
                    echo json_encode($get->get_chatter_message());
                }
                break;
            case 'get_private_message':
                echo json_encode($get->get_private_message($request[1], $request[2]));
                break;
            default:
                http_response_code(403);
                break;
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        switch ($request[0]) {
            case 'login':
                echo json_encode($post->login($data));
                break;
            case 'store_chatter_message':
                echo json_encode($post->storeChatterMessage($data));
                break;
            case 'store_private_message':
                echo json_encode($post->storePrivateMessage($data));
                break;
            case 'change_active':
                echo json_encode($post->changeActive($data));
                break;
            case 'change_offline':
                echo json_encode($post->changeOffline($data));
                break;
            case 'upload_profile':
                echo json_encode($post->profile($data));
                break;
            default:
                http_response_code(403);
                break;
        }
        break;

    default:
        http_response_code(403);
        break;
}

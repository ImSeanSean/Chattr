<?php

class Post
{
    private $pdo;

    #constructor
    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }
    public function sendPayLoad($data, $remarks, $message, $code)
    {
        $status = array("remarks" => $remarks, "message" => $message);
        http_response_code($code);

        return array(
            "status" => $status,
            "data" => $data,
            "prepared_by" => "Chattr",
            "timestamp" => date_create(),
            "code" => $code
        );
    }

    public function executeQuery($sqlString)
    {
        $data = array();
        $errmsg = "";
        $code = 0;

        try {
            if ($result = $this->pdo->query($sqlString)->fetchAll()) {
                foreach ($result as $record) {
                    array_push($data, $record);
                }
                $code = 200;
                $result = null;
                return array("code" => $code, "data" => $data);
            } else {
                $errmsg = "No data found";
                $code = 404;
            }
        } catch (\PDOException $e) {
            $errmsg = $e->getMessage();
            $code = 403;
        }
        return array("code" => $code, "errmsg" => $errmsg);
    }
    //Login
    public function login($data)
    {
        //Initialize
        $email = $data->email;
        $password = $data->password;
        //Check if Email Exists
        $sql = "SELECT * FROM users WHERE email = :email";
        $stmt = $this->pdo->prepare($sql);
        $stmt->bindParam(':email', $email, PDO::PARAM_STR);
        $stmt->execute();
        // If User Found
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user) {
            if ($password == $user['password']) {
                return $user;
            } else {
                return null;
            }
        } else {
            return null;
        }
    }
    //Message
    public function storeChatterMessage($data)
    {
        //Initialize
        $userid = $data->userid;
        $username = $data->username;
        $message = $data->message;
        //SQL 
        $sqlString = "INSERT INTO chattermessages (userid,  username, message) VALUES (:userid, :username, :message)";
        //Bind
        $stmt = $this->pdo->prepare($sqlString);
        $stmt->bindParam(':userid', $userid);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':message', $message);
        //Execute
        if ($stmt->execute()) {
            // Return success response
            return $this->sendPayLoad(null, "Message stored successfully", "Message has been stored.", 200);
        } else {
            // Return failure response
            return $this->sendPayLoad(null, "Failed to store message", "Could not store the message.", 500);
        }
    }
    public function storePrivateMessage($data)
    {
        //Initialize
        $recipientid = $data->recipientid;
        $senderid = $data->senderid;
        $username = $data->username;
        $message = $data->message;
        //SQL
        $sqlString = "INSERT INTO privatemessages (senderid, recipientid, username, message) VALUES (:senderid, :recipientid, :username, :message)";
        //Bind
        $stmt = $this->pdo->prepare($sqlString);
        $stmt->bindParam(':senderid', $senderid);
        $stmt->bindParam(':recipientid', $recipientid);
        $stmt->bindParam(':username', $username);
        $stmt->bindParam(':message', $message);
        //Execute
        if ($stmt->execute()) {
            // Return success response
            return $this->sendPayLoad(null, "Message stored successfully", "Message has been stored.", 200);
        } else {
            // Return failure response
            return $this->sendPayLoad(null, "Failed to store message", "Could not store the message.", 500);
        }
    }
    public function changeActive($data)
    {
        // Initialize
        $userid = $data->userid;

        // SQL
        $sqlString = "UPDATE users SET active = 1 WHERE userid = :userid";

        // Bind and Execute
        try {
            $stmt = $this->pdo->prepare($sqlString);
            $stmt->bindParam(':userid', $userid);

            if ($stmt->execute()) {
                return $this->sendPayLoad($stmt, "User's active status changed", "Active status is successfully changed.", 200);
            } else {
                return $this->sendPayLoad(null, "Failed to change status", "Could not change the user's active status.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayLoad(null, "Failed to change status", $e->getMessage(), 500);
        }
    }

    public function changeOffline($data)
    {
        // Initialize
        $userid = $data->userid;

        // SQL
        $sqlString = "UPDATE users SET active = 0 WHERE userid = :userid";

        // Bind and Execute
        try {
            $stmt = $this->pdo->prepare($sqlString);
            $stmt->bindParam(':userid', $userid);

            if ($stmt->execute()) {
                return $this->sendPayLoad($stmt, "User's active status changed", "Offline status is successfully changed.", 200);
            } else {
                return $this->sendPayLoad(null, "Failed to change status", "Could not change the user's active status.", 500);
            }
        } catch (PDOException $e) {
            return $this->sendPayLoad(null, "Failed to change status", $e->getMessage(), 500);
        }
    }

    public function profile($data)
    {
        $id = $_POST['userid'];

        if (isset($_FILES['image']) && $_FILES['image']['error'] == 0) {
            $filePath = $this->profilePhotoUpload($_FILES['image'], $id);
        }

        // If image was uploaded, update the post with the image path
        if ($filePath) {
            $updateQuery = "UPDATE users SET profile = :image WHERE userid = :userid";
            $updateStmt = $this->pdo->prepare($updateQuery);
            $updateStmt->execute([
                ':image' => $filePath,
                ':userid' => $id
            ]);
        }

        return $id;
    }

    private function profilePhotoUpload($fileData, $userId)
    {
        if (!isset($fileData) || $fileData === null) {
            return;
        }

        // EXTRACTING FILE INFORMATION FROM $FILEDATA
        $fileName = $fileData['name'];
        $fileSize = $fileData['size'];
        $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION)); // Use lowercase for consistency

        // CHECK IF FILE IS AN IMAGE
        $allowedExtensions = array(
            'jpg',
            'jpeg',
            'png',
            'gif',
            'bmp',
            'svg',
            'webp',
            'tiff',
            'tif',
            'ico',
            'psd',
            'raw',
            'heic',
            'heif',
            'avif',
            'jfif',
            'pjpeg'
        );

        if (!in_array($fileExt, $allowedExtensions)) {
            return;
        }

        // CHECK IF FILE IS A VALID IMAGE
        $imageInfo = getimagesize($fileData['tmp_name']);
        if (!$imageInfo) {
            return;
        }

        // CREATE THE DIRECTORY THAT STORES FILES IF IT DOESN'T ALREADY EXIST
        $dir = __DIR__ . '/../images/users';
        if (!file_exists($dir)) {
            mkdir($dir, 0777, true);
        }

        // Set the target file name to the user ID
        $targetFile = $dir . '/' . $userId . '.' . $fileExt;

        // If the file already exists, it will be replaced automatically
        if (move_uploaded_file($fileData['tmp_name'], $targetFile)) {
            // FILE PATH FOR DB
            return $userId . '.' . $fileExt; // Return the path to be stored in the database
        }

        return null; // Return null if the upload failed
    }
}

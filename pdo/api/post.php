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
            "data" => $data,  // Include data in the response
            "prepared_by" => "AppointMe",
            "timestamp" => date_create(),
            "code" => $code  // Include code in the response
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
}

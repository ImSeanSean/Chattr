<?php

class Get
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
        // return array(
        //     "status" => $status,
        //     "data" => $data,
        //     "prepared_by" => "AppointMe",
        //     "timestamp" => date_create()
        // );
        return $data;
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

    public function get_records($table, $conditions = null)
    {
        $sqlStr = "SELECT * FROM $table";
        if ($conditions != null) {
            $sqlStr .= " WHERE " . $conditions;
        }

        $result = $this->executeQuery($sqlStr);

        if ($result['code'] == 200) {
            return $this->sendPayLoad($result['data'], "success", "Successfully retrieved data.", $result['code']);
        }

        return $this->sendPayLoad(null, "failed", "Failed to pull data.", $result['code']);
    }
    public function get_users($id = null)
    {
        $conditions = null;
        if ($id != null) {
            $conditions = "userid = $id";
        }
        return $this->get_records("users", $conditions);
    }
    public function get_active_users($id = null)
    {
        $conditions = "active = 1";
        if ($id != null) {
            $conditions .= " AND userid = :userid";
        }
        return $this->get_records("users", $conditions);
    }
    public function get_chatter_message($id = null)
    {
        $conditions = null;
        if ($id != null) {
            $conditions = "messageid = $id";
        }
        return $this->get_records("chattermessages", $conditions);
    }
    public function get_private_message($senderid, $recipientid)
    {
        $conditions = null;
        if ($recipientid != null && $senderid != null) {
            $conditions = "(recipientid = $recipientid AND senderid = $senderid 
                                OR recipientid = $senderid AND senderid = $recipientid)";
        }

        return $this->get_records("privatemessages", $conditions);
    }
}

<?php

require __DIR__ . '\vendor\autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class Chat implements MessageComponentInterface
{
    protected $users;
    protected $activeUsers;

    public function __construct()
    {
        $this->users = new \SplObjectStorage;
        $this->activeUsers = [];
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->users->attach($conn);

        //Reset Active Users
        $this->activeUsers = [];
        foreach ($this->users as $user) {
            $user->send(json_encode([
                'type' => 'status',
                'username' => '',
                'message' => 'Change status to active.'
            ]));
        }

        echo "Connection Established\n";
    }

    public function onClose(ConnectionInterface $conn)
    {
        $this->users->detach($conn);

        //Reset Active Users
        $this->activeUsers = [];
        foreach ($this->users as $user) {
            $user->send(json_encode([
                'type' => 'status',
                'username' => '',
                'message' => 'Change status to active.'
            ]));
        }

        echo "Connection Detached\n";
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        //Initialize
        $data = json_decode($msg);
        $username = $data->username;
        $message = $data->message;

        //If Active Users
        if ($data->type == "active") {
            $this->activeUsers[] = $username;
            //Variables
            $usernames = $this->activeUsers;
            echo $message . "\n";
            //Send to All
            foreach ($this->users as $user) {
                $user->send(json_encode([
                    'type' => 'active',
                    'username' => $usernames,
                    'message' => $usernames
                ]));
            }
        }
        //If Global Message
        if ($data->type == "global") {
            echo "{$username}: {$message}\n";
            foreach ($this->users as $user) {
                if ($from !== $user) {
                    $user->send(json_encode([
                        'type' => 'global',
                        'username' => $username,
                        'message' => $message
                    ]));
                }
            }
        }
        //If Private Message
        if ($data->type == "private") {
            $chatterid = $data->chatterid;
            echo "{$username} to ID:{$chatterid}: {$message}\n";

            $user
        }
    }

    public function onError(ConnectionInterface $conn, Exception $e)
    {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }
}

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new Chat()
        )
    ),
    8080
);

$server->run();

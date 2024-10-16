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
    protected $registeredUsers;

    public function __construct()
    {
        $this->users = new \SplObjectStorage;
        $this->activeUsers = [];
        $this->registeredUsers = [];
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
        //Remove 
        foreach ($this->registeredUsers as $username => $connections) {
            $key = array_search($conn, $connections);
            if ($key != false) {
                unset($this->userConnections[$username][$key]);

                // Clean up if the user has no more connections
                if (empty($this->userConnections[$username])) {
                    unset($this->userConnections[$username]);
                }
                break;
            }
        }
        //Reset Active Users
        $this->activeUsers = [];
        foreach ($this->users as $user) {
            $user->send(json_encode([
                'type' => 'status',
                'username' => '',
                'message' => 'Update status.'
            ]));
        }
        //Remove From Users
        $this->users->detach($conn);
        echo "Connection Detached\n";

        // $this->checkRegisteredUsers();
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        //Initialize
        $data = json_decode($msg);
        $username = $data->username;
        $message = $data->message;

        //Register Connection to Active Users
        if ($data->type == "register") {
            //Is the Username's Array Set
            if (!isset($this->registeredUsers[$username])) {
                $this->registeredUsers[$username] = [];
            }
            //Is the Connection Already in the Array
            foreach ($this->registeredUsers[$username] as $connection) {
                if ($connection === $from) {
                    return;
                }
            }
            //Add Connection to the Array
            $this->registeredUsers[$username][] = $from;

            echo $message . "\n";
        }

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
            $senderUsername = $data->username;
            $chatterUsername = $data->chatterUsername;
            //Check if user is logged in
            if (isset($this->registeredUsers[$chatterUsername])) {
                foreach ($this->registeredUsers[$chatterUsername] as $connection) {
                    $connectionId = $connection->resourceId;
                    echo "Connection ID: {$connectionId}\n";
                    echo "{$username} to {$chatterUsername}: {$message}\n\n";
                    $connection->send(json_encode([
                        'type' => 'private',
                        'username' => $username,
                        'message' => $message
                    ]));
                }
            }
            //Send to Other Connections of Sender
            if (isset($this->registeredUsers[$senderUsername])) {
                foreach ($this->registeredUsers[$senderUsername] as $connection) {
                    if ($connection == $from) {
                        continue;
                    }
                    $connectionId = $connection->resourceId;
                    echo "Connection ID: {$connectionId}\n";
                    echo "{$username} to {$username}: {$message}\n\n";
                    $connection->send(json_encode([
                        'type' => 'private',
                        'receiver' => $chatterUsername,
                        'username' => $username,
                        'sender' => $username,
                        'message' => $message
                    ]));
                }
            }
        }
    }

    public function onError(ConnectionInterface $conn, Exception $e)
    {
        echo "Error: {$e->getMessage()}\n";
        $conn->close();
    }

    //Extra Functions
    private function checkRegisteredUsers()
    {
        foreach ($this->registeredUsers as $username => $connections) {
            echo "- Username: {$username}\n";
            foreach ($connections as $connection) {
                echo "  - Connection ID: {$connection->resourceId}\n";
            }
        }
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

<?php

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

class Chat implements MessageComponentInterface
{
    protected $users;

    public function __construct()
    {
        $this->users = new \SplObjectStorage;
    }

    public function onOpen(ConnectionInterface $conn)
    {
        $this->users->attach($conn);

        echo "Connection Established\n";
    }

    public function onClose(ConnectionInterface $conn)
    {
        $this->users->detach($conn);

        echo "Connection Detached\n";
    }

    public function onMessage(ConnectionInterface $from, $msg)
    {
        foreach ($this->users as $user) {
            if ($from !== $user) {
                $user->send($msg);
            }
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

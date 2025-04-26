<?php
	require_once('Client.class.php');
	
	use \MeinChatserver\Client;

	$client = new Client('demo.mein-chatserver.de', 2710);
	
	// Enable Debug-Mode
	$client->setDebug(true);

	$client->onData(function($packet) use ($client) {
		if($packet['operation'] === 'CONFIGURATION') {
			$client->send((object) [
				'operation' => '__INTERNAL__',
				'data'		=> 'STATUS'
			]);
		} else if(in_array($packet['operation'], [ '__RESPONSE__', '__ERROR__' ])) {
			print_r($packet);			
			$client->close();
		}
	});
	
	$client->connect();
?>
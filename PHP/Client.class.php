<?php
	/**
	 * Mein Chatserver
	 * ▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔▔
	 * Licensed Materials - Property of mein-chatserver.de.
	 * © Copyright 2024. All Rights Reserved.
	 *
	 * @version 1.0.0
	 * @author  Adrian Preuß
	 */
	 
	namespace MeinChatserver;
	
	class Client {
		private $hostname	= 'localhost';
		private $port		= -1;
		private $timeout	= 30;
		private $socket		= null;
		private $running	= false;
		private $debug		= false;
		private $callback	= null;
		
		public function __construct($hostname = null, $port = -1) {
			if(!empty($hostname)) {
				$this->hostname = $hostname;
			}
			
			$this->port = $port;
		}

		public function setDebug($state) {
			$this->debug = $state;
		}
		
		public function connect() {
			$this->socket = stream_socket_client(sprintf('tcp://%s:%d', $this->hostname, $this->port), $code, $message, $this->timeout, STREAM_CLIENT_CONNECT | STREAM_CLIENT_ASYNC_CONNECT);
			
			if($this->debug) {
				printf('[TCP] Connecting to %s:%d' . PHP_EOL, $this->hostname, $this->port);
			}

			if(!$this->socket || feof($this->socket)) {
				throw new \Exception(sprintf('Connection failed: %s (%d)', $message, $code));
			}

			if(strtoupper(substr(PHP_OS, 0, 3)) !== 'WIN') {
				@stream_set_blocking($this->socket, false);
			}

			$this->onConnected();
		}
		
		public function onData($callback) {
			if($this->debug) {
				print('[TCP] Register Callback.' . PHP_EOL);
			}

			$this->callback = $callback;
		}
		
		private function onConnected() {
			if($this->debug) {
				print('[TCP] Successfully connected.' . PHP_EOL);
			}

			$this->running = true;
			
			$this->send((object) [
				'operation' => 'HANDSHAKE',
				'data'		=> [
					'client'	=> 'PHP',
					'version'	=> 'V1.0',
					'location'	=> (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'Website'),
					'useragent'	=> (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'none')
				]
			]);
				
			$this->loop();
		}
		
		public function close() {
			$this->running = false;
			
			if($this->debug) {
				print('[TCP] Close connection.' . PHP_EOL);
			}

			fclose($this->socket);
		}
		
		public function send($packet) {
			if(!$this->socket || feof($this->socket) || !$this->running) {
				if($this->debug) {
					print('[TCP] Can\'t send: Not connected.' . PHP_EOL);
				}

				$this->close();
				return;
			}
			
			$read	= null;
			$write	= [$this->socket];
			$except	= null;
			$data	= json_encode($packet);
			
			if($this->debug) {
				printf('[SEND] %s' . PHP_EOL, $data);
			}

			stream_select($read, $write, $except, 5, 0);
			fwrite($this->socket, pack('N', strlen($data)) . $data);
			fflush($this->socket);
		}
		
		public function loop() {
			while($this->running) {
				$read	= [$this->socket];
				$write	= null;
				$except	= null;

				if(stream_select($read, $write, $except, 0, 100000)) {
					foreach($read AS $socket) {
						$length = fread($socket, 4);
						
						if(strlen($length) !== 4) {
							continue;
						}
						
						$length	= unpack('N', $length)[1];
						$data	= '';
						
						while(strlen($data) < $length) {
							$chunk = fread($socket, $length - strlen($data));
							
							if($chunk === false || $chunk === '') {
								break;
							}
							
							$data .= $chunk;
						}

						$result = @json_decode($data, true);

						if($this->debug) {
							printf('[RECEIVE] %s' . PHP_EOL, $data);
						}

						if($this->callback !== null && $result !== null) {
							call_user_func($this->callback, $result);
						}
					}
				}

				usleep(10000);
			}
		}
	}
?>
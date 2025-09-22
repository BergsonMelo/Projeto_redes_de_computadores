extends Node

var socket: StreamPeerTCP
var connected: bool = false

func _ready():
	socket = StreamPeerTCP.new()
	print("Conectando...")
	socket.connect_to_host("127.0.0.1", 8081)

func _process(delta):
	socket.poll()
	
	var status = socket.get_status()
	
	if status == StreamPeerTCP.STATUS_CONNECTED and not connected:
		connected = true
		print("CONECTADO!")
		socket.put_data("Ola servidor!\n".to_utf8_buffer())
	
	if connected and socket.get_available_bytes() > 0:
		var data = socket.get_data(socket.get_available_bytes())
		print("Recebido:", data[1].get_string_from_utf8())

func send_key(key: String):
	if connected:
		socket.put_data((key + "\n").to_utf8_buffer())

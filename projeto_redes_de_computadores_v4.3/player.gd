extends Polygon2D

var PontoCardeal = 0
var xBase = 1 # Aperta pra frente altera esse valor
var yBase = 1
var atuar = false

# Norte = 0 Leste = 1 Sul = 2 Oeste = 3
# Move sentido leste horário, oeste antihorário, para trás

func InputMovement():
	var tecla_enviada := ""
	
	# Detecta movimentos
	if Input.is_action_just_pressed("Frente"): 
		atuar = true
		tecla_enviada = "W"
		if not $RayCast2D.is_colliding():
			$seta.rotation = 0
			match PontoCardeal:
				0:
					yBase -= 1
					$".".position.y = position.y - 10
				1:
					xBase += 1
					$".".position.x = position.x + 10
				2:
					yBase += 1
					$".".position.y = position.y + 10
				3:
					xBase -= 1
					$".".position.x = position.x - 10

	elif Input.is_action_just_pressed("Atras"):
		atuar = true
		tecla_enviada = "S"
		$seta.rotation = 3.14
		PontoCardeal += 2
		PontoCardeal %= 4
		$".".rotation = PontoCardeal * 3.14 / 2

	elif Input.is_action_just_pressed("Direita"):
		atuar = true
		tecla_enviada = "D"
		$seta.rotation = 3.14 / 2
		PontoCardeal += 1
		PontoCardeal %= 4
		$".".rotation = PontoCardeal * 3.14 / 2

	elif Input.is_action_just_pressed("Esquerda"):
		atuar = true
		tecla_enviada = "A"
		$seta.rotation = -3.14 / 2
		PontoCardeal += 3
		PontoCardeal %= 4
		$".".rotation = PontoCardeal * 3.14 / 2

	if atuar:
		$Timer.start()
		
	# Envia a tecla para o servidor WebSocket
	if tecla_enviada != "":
		Network.send_key(tecla_enviada)

# Função para atualizar a visibilidade das paredes e itens
func atualizar_imagem():
	$Node2D/preto.visible = true

	# Frente
	$Node2D/paredes3/parede_f.visible = $detectoras_parede/frente2.has_overlapping_areas()
	$Node2D/paredes2/parede_f.visible = $detectoras_parede/frente1.has_overlapping_areas()
	$Node2D/paredes/parede_f.visible = $RayCast2D.is_colliding()

	# Direita
	$Node2D/paredes/parede_d.visible = $detectoras_parede/direita.has_overlapping_areas()
	$Node2D/paredes2/parede_d.visible = $detectoras_parede/direita2.has_overlapping_areas()
	$Node2D/paredes/parede_f_direita.visible = $detectoras_parede/direita3.has_overlapping_areas()
	$Node2D/paredes2/parede_d2.visible = $detectoras_parede/direita4.has_overlapping_areas()
	$Node2D/paredes2/parede_f_direita.visible = $detectoras_parede/direita5.has_overlapping_areas()
	$Node2D/paredes3/parede_d.visible = $detectoras_parede/direita6.has_overlapping_areas()
	$Node2D/paredes3/parede_d2.visible = $detectoras_parede/direita7.has_overlapping_areas()
	$Node2D/paredes3/parede_f_direita.visible = $detectoras_parede/direita8.has_overlapping_areas()
	$Node2D/paredes2/parede_f_direita2.visible = $detectoras_parede/direita9.has_overlapping_areas()

	# Esquerda
	$Node2D/paredes/parede_e.visible = $detectoras_parede/esquerda.has_overlapping_areas()
	$Node2D/paredes2/parede_f_esquerda.visible = $detectoras_parede/esquerda2.has_overlapping_areas()
	$Node2D/paredes2/parede_e.visible = $detectoras_parede/esquerda3.has_overlapping_areas()
	$Node2D/paredes2/parede_e2.visible = $detectoras_parede/esquerda4.has_overlapping_areas()
	$Node2D/paredes2/parede_f_esquerda.visible = $detectoras_parede/esquerda5.has_overlapping_areas()
	$Node2D/paredes3/parede_e.visible = $detectoras_parede/esquerda6.has_overlapping_areas()
	$Node2D/paredes3/parede_e2.visible = $detectoras_parede/esquerda7.has_overlapping_areas()
	$Node2D/paredes3/parede_f_esquerda.visible = $detectoras_parede/esquerda8.has_overlapping_areas()
	$Node2D/paredes2/parede_f_esquerda2.visible = $detectoras_parede/esquerda9.has_overlapping_areas()

	# Itens
	$Node2D/paredes/item.visible = $"detector entidades/aqui".has_overlapping_areas()
	$Node2D/paredes2/item.visible = $"detector entidades/frente".has_overlapping_areas()
	$Node2D/paredes3/item.visible = $"detector entidades/frente2".has_overlapping_areas()
	$Node2D/paredes2/item_direita.visible = $"detector entidades/direita".has_overlapping_areas()
	$Node2D/paredes3/item_direita.visible = $"detector entidades/direita2".has_overlapping_areas()
	$Node2D/paredes2/item_esquerda.visible = $"detector entidades/esquerda".has_overlapping_areas()
	$Node2D/paredes3/item_esquerda.visible = $"detector entidades/esquerda2".has_overlapping_areas()

	$Node2D/preto.visible = false

# Chamado a cada frame
func _process(delta: float) -> void:
	if not atuar:
		InputMovement()
	
	if $objetivo.is_colliding():
		atuar = true
		$Node2D/Label.visible = true

# Timer
func _on_timer_timeout() -> void:
	atuar = false
	atualizar_imagem()

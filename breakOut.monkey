
Strict

'TODO: corriger ceci
' MonkeyTools.monkey

#If TARGET="android" Then
#Else If TARGET="html5"
    Import "breakOut.data/HidePointer.js"
	Import fantomEngine
    Extern
        Function HidePointer:Void()="MonkeyTools.HidePointer"
		Function ShowPointer:Void() = "MonkeyTools.ShowPointer"
#Endif

Public

#rem
	Script:		baseScript.monkey
	Description:	Breakout clone with mario theme
	Author: 		Moerin
	Version:      0.5
#end

'Import fantomEngine

Global g:game


'***************************************
Class game Extends App
	Field eng:engine
	Field isSuspended:Bool = False
	
	Field cw:Float
	Field ch:Float
	
	Field layerTitle:ftLayer
	Field layerGame:ftLayer
	Field layerBackGround:ftLayer
	Field layerInfo:ftLayer
	
	Field font1:ftFont
	
	Field imgLife:ftObject
	
	Field txtLife:ftObject
	Field txtWin:ftObject
	Field txtLose:ftObject
	
	Field raquette:ftObject
	Field ball:ftObject
	
	Field speed:float
	Field moving:Bool = False
	
	Field life:Int
	Field blockCount:int
	
	'*** Sound Effect ***
	Field sndBreakBlock:ftSound
	Field sndLostLife:ftSound
	Field sndCoin:ftSound
	Field sndGameOver:ftSound
	Field sndBounce:ftSound
	Field sndWin:ftSound
	
	Field debug:Bool = False
	
	Field gameMode:Int = gmTitle
	
	Const raquetteId:Int = 1
	Const ballId:Int = 2
	
	Const grpRaquette:Int = 3
	Const grpBall:Int = 4
	Const grpBlock:Int = 5
	
	Const gmPlay:Int = 6
	Const gmGameOver:Int = 7
	Const gmTitle:Int = 8
	
	Const ballSize:Int = 48
	Const blockSize:Int = 40
	
	Const noBrick:Int = 0
	Const tileBrick:Int = 1
	Const tileQuestion:Int = 2
	
	'------------------------------------------
	Method OnCreate:Int()
		SetUpdateRate(60)
		eng = New engine
		
		cw = eng.canvasWidth
		ch = eng.canvasHeight
		
		font1 = eng.LoadFont("smb")
		
		LoadSounds()
		CreateLayers()
		CreateBackGroundScreen()
		CreateInfoText()
		CreateTitleScreen()
		Return 0
	End
	
	'------------------------------------------
	Method OnUpdate:Int()
		Local d:Float = Float(eng.CalcDeltaTime())/60.0
		If isSuspended = False Then
			Select gameMode
				Case gmPlay
					eng.Update(Float(d))
					eng.CollisionCheck(layerGame)
					txtLife.SetText("Life : " + life)
				Case gmTitle
					If MouseHit(0) Then
						StartNewGame()
					EndIf
				Case gmGameOver
					If KeyHit(KEY_ESCAPE) Then
						gameMode = gmTitle
						layerTitle.SetActive(True)
					Endif
			End
			
		EndIf
		Return 0
	End
	'------------------------------------------
	Method OnRender:Int()
		Cls
		eng.Render()
		Return 0
	End
	'------------------------------------------
	Method OnResume:Int()
		isSuspended = False
		SetUpdateRate(60)
		Return 0
	End
	'------------------------------------------
	Method OnSuspend:Int()
		isSuspended = True
		SetUpdateRate(5)
		Return 0
	End
	
	Method LoadSounds:Void()
		sndBreakBlock = eng.LoadSound("break")
		sndLostLife = eng.LoadSound("smw_lost_a_life")
		sndCoin = eng.LoadSound("smw_coin")
		sndGameOver = eng.LoadSound("smw_game_over")
		sndBounce = eng.LoadSound("stomp")
		sndWin = eng.LoadSound("smw_keyhole_exit")
	End
	'------------------------------------------
	Method CreateRaquette:Void()
		'raquette = eng.CreateBox(100, 16, cw / 2, ch / 6 * 5)
		raquette = eng.CreateImage("donut_paddle.png", cw / 2, ch / 6 * 5)
		raquette.SetHeight(16)
		raquette.SetWidth(100)
		'raquette.SetColor(255, 0, 0)
		raquette.SetColGroup(grpRaquette)
		'raquette.SetColWith(grpBall, True)
		raquette.SetID(raquetteId)
		raquette.SetLayer(layerGame)
		If debug = True Then
			Local circle:= eng.CreateCircle(5, raquette.xPos, raquette.yPos)
			circle.SetParent(raquette)
			circle.SetColor(255, 0, 0)
		EndIf
	End
	'------------------------------------------
	Method CreateBall:Void(x:Float, y:float)
		'ball = eng.CreateCircle(10, x, y - 18)
		ball = eng.CreateImage("ball.png", x, y - (48 + ballSize / 4)) '<--- collison a partir de 47 pixel ???
		ball.SetRadius(ballSize / 2)
		ball.SetColor(255, 255, 255)
		ball.SetScale(0.5)
		ball.SetColGroup(grpBall)
		ball.SetColWith(grpRaquette, True)
		ball.SetColWith(grpBlock, True)
		ball.SetID(ballId)
		ball.SetMaxSpeed(20)
		ball.SetLayer(layerGame)
		ball.SetParent(raquette)
		If debug = True Then
'			Local line:= eng.CreateLine(ball.xPos, ball.yPos, ball.xPos, ball.yPos + 20)
'			line.SetParent(ball)
'			line.SetColor(255, 125, 0)
'			line.SetAngle(ball.GetSpeedAngle())
			Local circle:= eng.CreateCircle(ball.GetRadius(), ball.xPos, ball.yPos)
			circle.SetParent(ball)
			circle.SetColor(255, 0, 0)
			circle.SetAlpha(0.7)
		EndIf
	End
	'------------------------------------------
	Method CreateLayers:Void()
		layerBackGround = eng.GetDefaultLayer()
		layerGame = eng.CreateLayer()
		layerInfo = eng.CreateLayer()
		layerTitle = eng.CreateLayer()
	End
	'------------------------------------------
'	Method CreateBlocks:Void()
'		Local blockXOrigin:Float = 70
'		Local blockYOrigin:Float = 20
'		Local x:Float = blockXOrigin
'		Local y:Float = blockYOrigin
'		
'		blockCount = 50
'		
'		For Local rows:Int = 1 To 5
'			For Local cols:Int = 1 To 10
'				'Local block:ftObject = eng.CreateBox(40.0, 20.0, cols * 40.0 + 70, rows * 20.0 + 20)
'				Local block:ftObject = eng.CreateImage("brick.png", cols * (blockSize / 2.0) + cw / 2 - 125, rows * (blockSize / 2.0) + 20)
'				block.SetLayer(layerGame)
'				block.SetScale(0.5)
'				'block.SetColor(Rnd(0, 256), Rnd(0, 256), Rnd(0, 256))
'				block.SetColGroup(grpBlock)
'				block.SetColWith(grpBall, True)
'			Next
'		Next
'	End

'------------------------------------------
	Method CreateBlocks:Void(x:float, y:float, blockType:int)
		If blockType = tileBrick Then
			Local block:ftObject = eng.CreateImage("brick.png", x * (blockSize), y * (blockSize))
			block.SetLayer(layerGame)
			block.SetScale(0.8)
			block.SetColGroup(grpBlock)
			block.SetColWith(grpBall, True)
		EndIf
		If blockType = tileQuestion Then
			Local block:ftObject = eng.CreateImage("question.png", x * (blockSize), y * (blockSize))
			block.SetLayer(layerGame)
			block.SetScale(0.8)
			block.SetColGroup(grpBlock)
			block.SetColWith(grpBall, True)
		EndIf
		blockCount += 1
	End

	'------------------------------------------
	Method LoadBlocks:Void()
		'Load a text file into a string
		Local levelText:String = LoadString("level1.txt")
		'Split each line of the string into a string array
		Local lines:= levelText.Split(String.FromChar(10))
		'Determine the count of lines
		Local ly:Int = lines.Length()
		'The level array
		Local level:Int[]
		level = level.Resize(255)
		Local levelTile:Int=0
		Local lx:Int
		For Local line:= Eachin lines
			line=line.Trim()
			If line = "" Then Continue
			Local leveldata:= line.Split(";")
			lx = leveldata.Length()
			For Local tile:= Eachin leveldata
				levelTile += 1
				level[levelTile] = Int(tile.Trim())
			Next
		Next
		
		levelTile = 0
		For Local h:Int = 0 To 11
			For Local w:Int = 0 To 15
				levelTile += 1
				Select level[levelTile]
					Case noBrick
						Continue
					Case tileBrick
						CreateBlocks(w, h, tileBrick)
					Case tileQuestion
						CreateBlocks(w, h, tileQuestion)
				End
			Next
		Next
	End
	
	'------------------------------------------
	Method CreateBackGroundScreen:Void()
		eng.SetDefaultLayer(layerBackGround)
		Local obj:ftObject = eng.CreateImage("background.jpg", cw / 2, ch / 2)
	End
	'------------------------------------------
	Method CreateInfoText:Void()
		eng.SetDefaultLayer(layerInfo)
		txtLife = eng.CreateText(font1, "Life : " + life, 10, ch - 30)
		txtLife.SetScale(0.5)
		txtWin = eng.CreateText(font1, "Win! Press 'ESC' to return to the title screen", cw / 2, ch / 4 * 3, 3)
		txtWin.SetScale(0.70)
		txtLose = eng.CreateText(font1, "Lose! Press 'ESC' to return to the title screen", cw / 2, ch / 4 * 3, 3)
		txtLose.SetScale(0.70)
		imgLife = eng.CreateImage("racket.png", txtLife.GetWidth() +30, ch - 15) ' faire une liste d'objet
		imgLife.SetScale(0.20)
	End
	
	Method CreateTitleScreen:Void()
		eng.SetDefaultLayer(layerTitle)
		Local box:ftObject = eng.CreateBox(cw, ch, cw / 2, ch / 2)
		box.SetColor(255, 0, 0)
		Local box2:ftObject = eng.CreateBox(cw - 40, ch - 40, cw / 2, ch / 2)
		Local img:ftObject = eng.CreateImage("champignons.jpg", cw / 2, ch / 2 - 50)
		img.SetScale(0.7)
		Local tx1:ftObject = eng.CreateText(font1, "MushRoom Breakout", cw / 2, ch / 5, 3)
		Local tx2:ftObject = eng.CreateText(font1, "Click to play!", cw / 2, ch / 5 * 3, 3)
	End
	
	Method StartNewGame:Void()
		life = 3
		blockCount = 0
		layerTitle.SetActive(False)
		layerGame.RemoveAllObjects()
		eng.SetDefaultLayer(layerGame)
		CreateRaquette()
		CreateBall(raquette.GetPosX(), raquette.GetPosY())
		LoadBlocks()
		gameMode = gmPlay
		txtLife.SetActive(True)
		imgLife.SetActive(True)
		txtWin.SetActive(False)
		txtLose.SetActive(False)
	End
	
End

'***************************************
Class engine Extends ftEngine
	'------------------------------------------
	Method OnObjectCollision:Int(obj:ftObject, obj2:ftObject)
		If obj.GetColGroup() = g.grpBall and obj2.GetColGroup() = g.grpRaquette Then 'TODO : corriger le comportement du paddle collision a paddle.ypos + paddle.height - 50
			Local ball:ftObject = obj
			Local raquette:ftObject = obj2
			g.sndBounce.Play()
			' No angle
			If ball.xPos >= (raquette.xPos - 12.5) And ball.xPos <= (raquette.xPos + 12.5) And ball.yPos + g.ballSize / 4 > (raquette.yPos - 8.0) Then
				ball.SetSpeedY(-ball.GetSpeedY())
			EndIf
			' Angle 72.5 paddle between 12.5 and 25
			If ball.xPos <= (raquette.xPos + 25.0) And ball.xPos > (raquette.xPos + 12.5) And ball.yPos + g.ballSize / 4 > (raquette.yPos - 8.0) Then
				ball.SetSpeedAngle(77.5)
				'ball.SetPosY(raquette.yPos - 20)
			EndIf
			' Angle 45 paddle between 25 and 37.5
			If ball.xPos <= (raquette.xPos + 37.5) And ball.xPos > (raquette.xPos + 25) And ball.yPos + g.ballSize / 4 > (raquette.yPos - 8.0) Then
				ball.SetSpeedAngle(45.0)
				'ball.SetPosY(raquette.yPos - 20)
			EndIf
			' Angle 12.5 paddle between 37.5 and 50
			If ball.xPos <= (raquette.xPos + 50.0) And ball.xPos > (raquette.xPos + 37.5) And ball.yPos + g.ballSize / 4 > (raquette.yPos - 8.0) Then
				ball.SetSpeedAngle(12.5)
				'ball.SetPosY(raquette.yPos - 20)
			EndIf
			
			' Angle -72.5 paddle between -12.5 and -25
			If ball.xPos >= (raquette.xPos - 25.0) And ball.xPos < (raquette.xPos - 12.5) And ball.yPos + g.ballSize / 4 > (raquette.yPos - 8.0) Then
				ball.SetSpeedAngle(-77.5)
				'ball.SetPosY(raquette.yPos - 20)
			EndIf
			' Angle -45 paddle between -25 and -37.5
			If ball.xPos >= (raquette.xPos - 37.5) And ball.xPos < (raquette.xPos - 25) And ball.yPos + g.ballSize / 4 > (raquette.yPos - 8.0) Then
				ball.SetSpeedAngle(-45.0)
				'ball.SetPosY(raquette.yPos - 20)
			EndIf
			' Angle -12.5 paddle between -37.5 and -50
			If ball.xPos >= (raquette.xPos - 50.0) And ball.xPos < (raquette.xPos - 37.5) And ball.yPos + g.ballSize / 4 > (raquette.yPos - 8.0) Then
				ball.SetSpeedAngle(-12.5)
				'ball.SetPosY(raquette.yPos - 20)
			EndIf
			Print("Collision : " + ball.yPos)
			Print("Raquette : " + (raquette.yPos))
					
		EndIf
		If obj.GetColGroup() = g.grpBlock Then
			Local block:ftObject = obj
			Local ball:ftObject = obj2
			Local removeBlock:bool = False
			Local x:Int = (block.xPos + block.GetWidth() / 2) - (ball.xPos + ball.GetRadius())
			Local y:Int = (block.yPos + block.GetWidth() / 2) - (ball.yPos + ball.GetRadius())
			
			If Abs(x) > Abs(y) Then
				ball.SetSpeedX(-ball.GetSpeedX())
				block.Remove()
				removeBlock = True
			Else
				ball.SetSpeedY(-ball.GetSpeedY())
				block.Remove()
				removeBlock = True
			EndIf
			
'			If (ball.yPos - ball.GetHeight() / 2 < block.yPos + block.GetHeight() / 2) or (ball.yPos + ball.GetHeight() / 2 > block.yPos - block.GetHeight() / 2) Then
'				'ball.SetSpeedAngle(135)
'				'ball.SetSpeedAngle(-ball.GetSpeedAngle())
'				ball.SetSpeedY(-ball.GetSpeedY())
'				'ball.SetPosY(block.GetPosY() +ball.GetHeight() / 2 + 20)
'				block.Remove()
'				'g.sndBlock.Play()
'				removeBlock = True
'			EndIf
'			If (ball.xPos + ball.GetWidth() / 2 + 20 > block.xPos - block.GetWidth() / 2) or (ball.xPos - ball.GetWidth() / 2 < block.xPos + block.GetWidth() / 2) Then
'				'ball.SetSpeedAngle(45)
'				'ball.SetSpeedAngle(-ball.GetSpeedAngle())
'				ball.SetSpeedX(-ball.GetSpeedX())
'				'ball.SetPosY(block.GetPosY() -ball.GetHeight() / 2 + 20)
'				block.Remove()
'				removeBlock = True
'			EndIf
			If removeBlock = True Then
				g.blockCount -= 1
			EndIf
			g.sndBreakBlock.Play()
		EndIf
		Return 0
	End
	'------------------------------------------
	Method OnObjectTimer:Int(timerId:Int, obj:ftObject)
		Return 0
	End	
	'------------------------------------------
	Method OnObjectTouch:Int(obj:ftObject, touchId:Int)
		Return 0
	End
	'------------------------------------------
	Method OnObjectTransition:Int(transId:Int, obj:ftObject)
		Return 0
	End
	'------------------------------------------
	Method OnObjectUpdate:Int(obj:ftObject)
		If obj.GetID() = g.raquetteId Then
			obj.SetPosX(MouseX())
'			If KeyDown(KEY_LEFT) Then
'				obj.SetPosX(-10.0, True)
'			EndIf
'			If KeyDown(KEY_RIGHT) Then
'				obj.SetPosX(10.0, True)
'			EndIf
			If MouseHit(0) and g.moving = False Then
				g.ball.SetParent(Null)
				g.speed = -20.0
				g.ball.SetSpeedY(g.speed)
				g.moving = True
			EndIf
			If obj.xPos < obj.GetWidth() / 2 Then
				obj.SetPosX(obj.GetWidth() / 2)
			EndIf
			If obj.xPos > g.cw - obj.GetWidth() / 2 Then
				obj.SetPosX(g.cw - obj.GetWidth() / 2)
			EndIf
		EndIf
		If obj.GetID() = g.ballId Then
			If obj.yPos < obj.GetRadius() And obj.GetSpeedY() < 0 Then
				obj.SetSpeedY(-obj.GetSpeedY())
			EndIf
			
			If obj.GetPosX() < g.ball.GetRadius() Then
				obj.SetSpeedX(-obj.GetSpeedX())
			EndIf
			
			If obj.GetPosX() > g.cw - g.ball.GetRadius() Then
				obj.SetSpeedX(-obj.GetSpeedX())
			EndIf
			
			If obj.yPos > g.ch Then
				obj.Remove()
				g.CreateBall(g.raquette.xPos, g.raquette.yPos)
				g.moving = False
				g.life -= 1
				g.sndLostLife.Play()
			EndIf
		EndIf
		
		Return 0
	End
	'------------------------------------------
	Method OnLayerTransition:Int(transId:Int, layer:ftLayer)
		Return 0
	End
	'------------------------------------------
	Method OnLayerUpdate:Int(layer:ftLayer)
		If g.blockCount <= 0 Then
			g.txtWin.SetActive(True)
			g.gameMode = g.gmGameOver
			g.sndGameOver.Play()
		ElseIf g.life <= 0 Then
			g.txtLose.SetActive(True)
			g.gameMode = g.gmGameOver
			g.sndLostLife.Stop()
			g.sndGameOver.Play()
		EndIf
		Return 0
	End	
End

'***************************************
Function Main:Int()
	g = New game
	Return 0
End

require: slotfilling/slotFilling.sc
  module = sys.zb-common
  
# Подключение javascript обработчиков
require: js/getters.js
require: js/reply.js
require: js/actions.js

# Подключение сценарных файлов

patterns:
    $AnyText = $nonEmptyGarbage

theme: /
    state: Start
        q!: $regex</start>
        q!: [салют] (запусти|открой|сыграем|давай поиграем) [в] [шахматы на двоих]
        a: Привет! В этом приложении можно играть со своими друзьями в шахматы. Для игры с пультом, нужно навести зеленый квадрат на фигуру, используя стрелки, подтвердить свой выбор нажатием кнопки OK и таким же образом выбрать клетку, на которую будет осуществлен ход. А для того чтобы переместить фигуру голосовой командой, необходимо назвать пару координат, используя английское произношение букв. Например, B1 H7 или D2 E4. 
        script:
            addSuggestions(["Начать заново", "Закрой игру"], $context)
        go!: /Script
        
    state: GameOver
        event!: game_over
        if: $context.request.data.eventData.value !== 0
                a: {{$context.request.data.eventData.value}}
        go!: /Restart
    
    state: NoFigure
        event!: no_figure
        if: $context.request.data.eventData.value !== 0
               a: {{$context.request.data.eventData.value}}
        go!: /Script
    
    state: WrongFigure
        event!: wrong_figure
        if: $context.request.data.eventData.value !== 0
                a: {{$context.request.data.eventData.value}}
        go!: /Script
        
    state: WrongMove
        event!: wrong_move
        if: $context.request.data.eventData.value !== 0
                a: {{$context.request.data.eventData.value}}
        go!: /Script
        
    state: Restart
        q!: [(начать|начни) (заново|новую игру)] 
        script:
            restart($context)
            addSuggestions(["Начать новую игру", "Закрой игру"], $context)
        random:
            a: Новая игра создана. Хорошей игры!
            a: Новая игра создана. 
        go!: /Script

    state: Script
        script:
            $response.replies = $response.replies || [];
            $response.replies.push({
              "type":"raw",
              "body":{
                  "asr_hints": {
                      "words": ["a", "b2", "b", "c", "d", "e", "f", "g", "h", "1", "2", "3", "4", "5",  "6", "7", "8"],
                      "enable_letters": true
                  },
              },
              "messageName":"ANSWER_TO_USER"
            })

    
    state: Move
        intent!: /moves
        q!: $AnyText::anyText 
        # a: {{$parseTree._anyText}}
        script:
            move($parseTree._anyText, $context)
            addSuggestions(["Начать новую игру", "Закрой игру"], $context)
            #addSuggestions([$parseTree._anyText, "Начать новую игру", "Закрой игру"], $context)
        go!: /Script
        
    state: Fallback
        event!: noMatch
        script:
            log('entryPoint: Fallback: context: ' + JSON.stringify($context))
            addSuggestions(["Начать новую игру", "Закрой игру"], $context)
        a: Пока я могу только начать новую игру, сделать ход по заданным координатам и закрыть приложение.
        go!: /Script
        
    state: Help
        q: * (помощь|умеешь|можешь) * 
        a: В этом приложении можно играть со своими друзьями в шахматы. Для игры с пультом, нужно навести зеленый квадрат на фигуру, используя стрелки, подтвердить свой выбор нажатием Enter и таким же образом выбрать клетку, на которую будет осуществлен ход. А для того чтобы переместить фигуру голосовой командой, необходимо назвать пару координат, используя английское произношение букв. Например, B1 H7. 
        script:
            addSuggestions(["Начать заново", "Закрой игру"], $context)
        go!: /Script

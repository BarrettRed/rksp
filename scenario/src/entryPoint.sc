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
        a: Привет!
        a: В этом приложении можно играть со своими друзьями в шахматы. Для игры с пультом, нужно навести зеленый квадрат на фигуру, используя стрелки, подтвердить свой выбор нажатием Enter и таким же образом выбрать клетку, на которую будет осуществлен ход. 
        script:
            addSuggestions(["Начать заново", "Закрой игру"], $context)
    
    state: GameOver
        event!: game_over
        if: $context.request.data.eventData.value !== 0
                a: {{$context.request.data.eventData.value}} 
            
    state: Restart
        q!: [(начать|начни) (заново|новую игру)] [да|хочу|хотим]
        script:
            restart($context)
            addSuggestions(["Начать новую игру", "Закрой игру"], $context)
        random:   
            a: Новая игра создана. 
            a: Хорошей игры!

    #state: Move
    #    q!: $AnyText::anyText
    #    a: hey?
    #   script:
    #       move($parseTree._anyText, $context)
    #       addSuggestions(["Начать новую игру", "Закрой игру", "Ход"], $context)

    state: Fallback
        event!: noMatch
        script:
            log('entryPoint: Fallback: context: ' + JSON.stringify($context))
            addSuggestions(["Начать новую игру", "Закрой игру"], $context)
        a: Пока я могу только начать новую игру и закрыть приложение.

    state: Help
        q: * (помощь|умеешь|можешь) * 
        a: В этом приложении можно играть со своими друзьями в шахматы. Для игры с пультом, нужно навести зеленый квадрат на фигуру, используя стрелки, подтвердить свой выбор нажатием Enter и таким же образом выбрать клетку, на которую будет осуществлен ход. 
        script:
            addSuggestions(["Начать заново", "Закрой игру"], $context)



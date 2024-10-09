theme: /
    
    state: move
        q!: [ход]
            $AnyText::anyText
            
        random:
            a: Добавлено!
            a: Записано!
            
        script:
            move($parseTree._anyText, $context);
            
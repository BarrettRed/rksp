function move(param, context) {
    addAction({
        type: "move",
        params: param,
    }, context);
}

function restart(context){
    addAction({
        type: "restart",
        params: "",
    }, context);
}


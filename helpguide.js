exports.helpGuide = function (subject){
    switch (subject){
        case ('petimp'): return 'Type "name" to name the pet. Type "reroll" to gen a new pet\n' +
            'Use "exit" to cancel.'; break;
        case ('namepet'): return 'Give your pet a name.\n' +
            'Use "exit" to cancel.'; break;
    }
}
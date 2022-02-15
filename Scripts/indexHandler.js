counter = 0 // EasterEgg

//Change menu screens
function goTo(from, to) {
    $(from).fadeOut()
    $(to).css("display","flex").hide()
    $(to).fadeIn()
}

//Visual Helper for what mode should be selected
function selectMode(obj) {
    $(".mode").removeClass("selected")
    $(obj).addClass("selected")
    $(".pvp").toggle()
}

//Go to game
function play() {
    //Check all inputs
    if(checkInputs()) {
        setOptions()
        $(".playMenu").fadeOut()
        setup()
    }
}

//EasterEgg
function clickOn() {
    counter++;
    if(counter >= 7) {
        $(".hard").css("display","flex").hide().fadeIn()
    }
}

//Set options for game
function setOptions() {
    matchLength = parseInt($("#matchLength").val())
    maxScore = parseInt($("#maxScore").val())
    mode = parseInt($(".mode.selected").attr("data"))
    difficulty = parseFloat($("#pcDiff").val()) / 100

    console.group("Set options")
    console.log("matchLength: " + matchLength)
    console.log("maxScore: " + maxScore)
    console.log("mode: " + mode)
    console.log("difficulty: " + difficulty)
    console.groupEnd()

}

//Check if all inputs are correct
function checkInputs() {
    //Check if mode is selected
    if($('.mode.selected').length < 0) {
        displayBanner("Mode has to be selected")
        return false
    }

    //Check if mode is valid
    if($('.mode.selected').attr("data") != "1" && $('.mode.selected').attr("data") != "2") {
        displayBanner("Ran into error, please refresh page")
        return false
    }

    //Check Maximal score
    var val = parseInt($("#maxScore").val())
    if(val < 3 || val > 50) {
        displayBanner("Maximal Score has to be within <3, 50>")
        return false
    }

    //Check match Length
    var val = parseInt($("#matchLength").val())
    if(val < 100 || val > 3600) {
        displayBanner("Match Length has to be within <100, 3600> s")
        return false
    }

    //If all is correct, continue
    return true
}

//Displays error when input is not correct
function displayBanner(msg) {
    $(".bannerText").text(msg)
    $(".banner").addClass("shown")
    setTimeout(() => {
        $(".banner").removeClass("shown")
    }, 2000)
}

//allow debugging
function changeDebug() {
    debug = $("#debug").is(":checked")
}

//EasterEgg
function changeHard() {
    hardmode = $("#hard").is(":checked")
}
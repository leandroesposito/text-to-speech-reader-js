const textarea = document.querySelector("#text");
const ttsVolume = document.querySelector("#volume");
const ttsRate = document.querySelector("#rate");
const progressBar = document.querySelector("#progress");

let voices = [];
let speaking = false;

const voicesCombobox = document.querySelector("#voices");
voicesCombobox.onchange = _ => {
    if (synth.speaking){
        synth.cancel();
    }
    utterance = new SpeechSynthesisUtterance(voicesCombobox.value);
    utterance.lang = voicesCombobox[voicesCombobox.selectedIndex].getAttribute("lang");
    utterance.voice = voices.find(voice => voice.name === voicesCombobox[voicesCombobox.selectedIndex].getAttribute("name"));
    // volume must be between 0 and 1
    utterance.volume = ttsVolume.value / 10;
    utterance.rate = ttsRate.value;
    synth.speak(utterance);
}

function onboundaryHandler(event){
    const text = textarea.value;
    const start = event.charIndex;
    let end = start + text.slice(start).search(/\s/);

    if (end == start - 1){
        end = text.length;
    }

    textarea.focus();

    textarea.selectionStart = start;
    textarea.selectionEnd = end;

    const progress = Math.floor(start / text.length * 100);
    if (speaking)
        progressBar.style.backgroundColor = "var(--light-orange)";
    progressBar.style.width = "" + progress + "%";
    progressBar.innerText = "" + progress + "%";
};

function speak(text){
    if (synth.speaking || synth.pending) synth.cancel();
    utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voicesCombobox[voicesCombobox.selectedIndex].getAttribute("lang");
    utterance.voice = voices.find(voice => voice.name === voicesCombobox[voicesCombobox.selectedIndex].getAttribute("name"));
    // volume must be between 0 and 1
    utterance.volume = ttsVolume.value / 10;
    utterance.rate = ttsRate.value;
    utterance.onboundary = onboundaryHandler;
    utterance.onstart = _ => {
        speaking = true;
    }
    utterance.onresume = _ => {
        speaking = true;
    }
    utterance.onpause = _ => {
        progressBar.style.backgroundColor = "var(--light-yellow)";
        speaking = false;
    }
    utterance.onboundary = onboundaryHandler;
    utterance.onend = event => {
        // check if complete, else means speak got cancelled
        if(event.charIndex == event.utterance.text.length){
            progressBar.innerText = "100%";
            progressBar.style.width = "100%";
            progressBar.style.backgroundColor = "var(--orange)";
        }
        else{
            progressBar.innerText = "";
        }
        speaking = false;
    }
    utterance.oncancel = _ => {
        progressBar.innerText = "";
    }
    synth.speak(utterance);
}

var synth = window.speechSynthesis;
synth.onvoiceschanged = _ => {
    loadVoices();
}

function loadVoices(){
    voices = synth.getVoices();
    for (let i = 0; i < voices.length; i++) {
        const voice = voices[i];
        const option = document.createElement("option");
        option.value = voice.name;
        option.textContent = voice.lang + " " + voice.name;
        option.setAttribute("lang", voice.lang);
        option.setAttribute("name", voice.name);
        voicesCombobox.appendChild(option);
    }
}

const btnPlay = document.querySelector("#btnPlay");

btnPlay.addEventListener("click", _ => {
    speak(textarea.value);
})

const btnPauseResume = document.querySelector("#btnPauseResume");

btnPauseResume.addEventListener("click", _ => {
    if(synth.paused){
        synth.resume();
    }
    else if(synth.speaking){
        synth.pause();
    }
})

const btnStop = document.querySelector("#btnStop");

btnStop.addEventListener("click", _ => {
    if(synth.paused || synth.speaking){
        synth.cancel();
    }
    progressBar.text = "";
})

window.onload = function () {
    if(synth.getVoices().length > 0){
        loadVoices();
    };
};
let characterCreated = false;
let characterInfo = {};
let currentChoices = [];

const dmThinkingLines = [
    "The DM strokes his long, silver beard, eyes flickering like candlelight in deep thought",
    "The DM taps his gnarled staff rhythmically against the stone floor, lost in ancient contemplation",
    "The DM leans back in his worn oak chair, gaze wandering through invisible realms of possibility",
    "The DM narrows his eyes, as though reading fate’s hidden script upon the air itself",
    "The DM mutters something unintelligible, consulting memories older than the kingdom’s founding",
    "The DM tilts his head, as if listening to a whisper carried from the other side of the veil",
    "The DM adjusts the brim of his wide hat, shadows dancing across his thoughtful face",
    "The DM gazes into a swirling crystal orb, seeking wisdom in its ever-changing depths",
    "The DM runs a hand through his beard, each strand a tangled tale yet untold",
    "The DM closes his eyes for a moment, breathing in the scent of old parchment and prophecy",
    "The DM’s fingers hover over an invisible tome, flipping pages in the library of his mind",
    "The DM offers a knowing smile, lost for a breath in some secret scheme or half-formed plan",
    "The DM's eyes flash like lightning behind storm clouds, as if struck by a sudden insight",
    "The DM casts his gaze toward the unseen horizon, watching destinies weave and unravel",
    "The DM whispers a forgotten word, and for a moment, the world seems to wait with him",
    "The DM raises an eyebrow, a soft chuckle escaping as he considers your curious fate",
    "The DM lifts a finger to the sky, as if plucking ideas from the constellations themselves",
    "The DM sighs—a sound like pages turning in a forgotten tome—as he weighs your path ahead",
    "The DM traces glowing symbols in the air, each one a fragment of thought crystallizing",
    "The DM consults a raven perched on his shoulder, nodding slowly at its silent counsel",
    "The DM squints into the ether, as if watching time unravel and reweave before his eyes",
    "The DM strokes his beard with deliberate care, each movement steeped in deliberate thought",
    "The DM whispers to the shadows behind his throne, considering what they whisper in return",
    "The DM twirls a quill between his fingers, sketching thoughts across the fabric of fate",
    "The DM cups his hands around an unseen flame, meditating on the warmth of potential futures",
    "The DM hums an old, arcane tune—a melody only the wise and weary remember",
    "The DM turns slowly toward the fire, watching the embers rise like thoughts made manifest",
    "The DM adjusts the rings on his fingers, each one glowing faintly with possibilities",
    "The DM stares into nothing, where perhaps only he sees the spinning gears of destiny",
    "The DM closes a massive tome with a soft thud, decision glinting in his ancient eyes"
];

function getRandomDmThinkingLine() {
    return dmThinkingLines[Math.floor(Math.random() * dmThinkingLines.length)];
}

async function appendToGameLog(text, isDM = false, useTyping = true) {
    const log = document.getElementById('game-log');
    const div = document.createElement("div");
    div.className = isDM ? 'dm-line' : 'chat-line';
    log.appendChild(div);

    if (useTyping) {
        await typeWriterEffect(text, div, 20);
    } else {
        div.innerHTML = text.replace(/\n/g, "<br>");
        log.scrollTo({
            top: log.scrollHeight,
            behavior: 'smooth'
        });
    }
}

function typeWriterEffect(text, element, delay = 20) {
    return new Promise(resolve => {
        let i = 0;

        function type() {
            if (i < text.length) {
                const char = text.charAt(i);
                element.innerHTML += char === "\n" ? "<br>" : char;
                i++;

                const log = document.getElementById('game-log');

                // 🔽 Kun scroll hvis brugeren er tæt på bunden (fx mindre end 100px fra)
                const isAtBottom = log.scrollHeight - log.scrollTop - log.clientHeight < 100;
                if (isAtBottom) {
                    log.scrollTo({
                        top: log.scrollHeight,
                        behavior: 'smooth'
                    });
                }

                setTimeout(type, delay);
            } else {
                resolve();
            }
        }

        type();
    });
}

function showThinking() {
    const log = document.getElementById('game-log');
    const thinkingDiv = document.createElement("div");
    thinkingDiv.id = "thinking";
    thinkingDiv.className = 'dm-line italic text-yellow-300';

    // Use a random flavorful DM line, keeping the "Thinking" with animated dots
    const randomLine = getRandomDmThinkingLine();
    thinkingDiv.innerHTML = `<span class="dots">🧙‍♂️ ${randomLine}</span>`;

    log.appendChild(thinkingDiv);
    log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
}

function removeThinking() {
    const existing = document.getElementById("thinking");
    if (existing) existing.remove();
}

async function createCharacter() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');

    appendToGameLog("🧙‍♂️ So.. traveller, who are thy? What is thy name?", true);
    userInput.focus();

    sendButton.onclick = async function () {
        const nameInput = userInput.value.trim();
        if (nameInput && !characterCreated) {
            characterInfo.name = nameInput;
            appendToGameLog(`🧝 ${nameInput}`);
            userInput.value = '';
            characterCreated = true;

            // 👇 HIDE the input bar here
            document.getElementById('input-container').style.display = 'none';

            await chooseClass();
        }
    };

    userInput.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });
}

async function chooseClass() {
    appendToGameLog(`🧙‍♂️ Great, ${characterInfo.name}! Choose your class:`, true);
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    const classes = ['Warrior', 'Mage', 'Rogue', 'Cleric'];
    classes.forEach((className, idx) => {
        const button = document.createElement('button');
        button.classList.add('button');
        button.textContent = `${idx + 1}. ${className}`;
        button.onclick = () => {
            characterInfo.class = className;
            appendToGameLog(`🧝 ${className}`);
            optionsContainer.innerHTML = '';
            startAdventure();
        };
        optionsContainer.appendChild(button);
    });
}

async function startAdventure() {
    appendToGameLog(`🧙‍♂️ Welcome, ${characterInfo.name} the ${characterInfo.class}! Your adventure begins...`, true);

    showThinking();
    const response = await fetch('http://localhost:8080/chat/adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: 'Start the adventure' })
    });
    removeThinking();

    if (response.ok) {
        const data = await response.json();
        const cleanedMessage = data.message
            .split('\n')
            .filter(line => !/^\d+\.\s/.test(line))
            .join('\n');

        appendToGameLog(`🧙‍♂️ ${cleanedMessage}`, true);

        const choices = extractChoicesFromMessage(data.message);

        currentChoices = choices;
        updateOptionsFromResponse(choices);
    } else {
        appendToGameLog("⚠️ Error: Could not retrieve adventure.", true);
    }
}

function extractChoicesFromMessage(message) {
    return message.split('\n')
        .filter(line => /^\d+\./.test(line))
        .map(line => {
            const text = line.replace(/^\d+\.\s*/, '').trim();
            return { text };
        });
}

function updateOptionsFromResponse(choices) {
    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';

    // Limit to a maximum of 4 choices
    const limitedChoices = choices.slice(0, 4);

    limitedChoices.forEach((choice, index) => {
        const button = document.createElement('button');
        button.classList.add('button');
        button.textContent = `${index + 1}. ${choice.text}`;
        button.onclick = () => handleUserChoice(index + 1, choice.text);

        button.disabled = false; // Hvis du ønsker at deaktivere, kan du gøre det her
        optionsContainer.appendChild(button);
    });
}

async function handleUserChoice(choiceIndex, choiceText) {
    await appendToGameLog(`🧝 ${choiceText}`, false, false);

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = ''; // Fjern alle knapper

    showThinking();
    const response = await fetch('http://localhost:8080/chat/adventure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userMessage: `I choose option ${choiceIndex}` })
    });
    removeThinking();

    if (response.ok) {
        const data = await response.json();
        // Remove lines like "1. 2. 3. etc."
        const cleanedMessage = data.message
            .split('\n')
            .filter(line => !/^\d+\.\s/.test(line))
            .join('\n');

        appendToGameLog(`🧙‍♂️ ${cleanedMessage}`, true);

        const choices = extractChoicesFromMessage(data.message);
        currentChoices = choices;
        updateOptionsFromResponse(choices);
    } else {
        appendToGameLog("⚠️ Error: Could not retrieve next part of adventure.", true);
    }
}

window.addEventListener('load', () => {
    appendToGameLog("🧙‍♂️ Ohh, hello traveller! Let’s begin thy journey...", true);
    createCharacter();
});
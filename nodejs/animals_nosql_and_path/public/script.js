document.addEventListener("DOMContentLoaded", function() {
    fetchAnimals();
    setupColorButtons();
    document.getElementById("showAnimal").addEventListener("click", ()=>{
        showAnimal();
        showSaying();
    });
});

let selectedColorButton = null; // Track the selected color button
let selectedAnimalButton = null; // Track the selected animal button

let selectedColor = '';
let selectedAnimalData = {};

async function fetchAnimals() {
    const response = await fetch('http://localhost:5001/api/animals');
    const animals = await response.json();
    const container = document.getElementById('animalButtons');

	container.innerText = "";
	
	animals.forEach(animal => {
		const buttonContainer = document.createElement('div');
        buttonContainer.classList.add('button-container');

        const button = document.createElement('button');
        button.style.backgroundImage = `url('http://localhost:5001/${animal.imgName}')`;
        button.addEventListener('click', function() {
            if (selectedAnimalButton) {
                selectedAnimalButton.classList.remove('selected'); // Deselect the previously selected button
            }
            selectedAnimalButton = buttonContainer; // Update the selected button reference
            buttonContainer.classList.add('selected'); // Mark the button as selected
            selectedAnimalData = animal;
        });

        // Create a label for the button
        const label = document.createElement('span');
        label.textContent = animal.animalName;
        label.classList.add('animal-name');

        // Append the button and label to the container, then the container to the main container
        buttonContainer.appendChild(button);
        buttonContainer.appendChild(label);
        container.appendChild(buttonContainer);	});
}

async function showAnimal() {
    const response = await fetch(`http://localhost:5001/api/myanimal?color=${selectedColor}&imgName=${encodeURIComponent(selectedAnimalData.imgName)}`);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const display = document.getElementById('animalDisplay');
    display.innerHTML = ''; // Clear previous content
    const img = document.createElement('img');
    img.src = url;
    display.appendChild(img);
}

function wait(seconds) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

let lastSayingFetchTime = undefined;
async function showSaying() {
    const sayingElement = document.getElementById('animalSaying');
    sayingElement.textContent = "What will I say?"; // Clear previous content

    lastSayingFetchTime = Date.now();
    const thisFetchTime = lastSayingFetchTime;
    console.log("asking for saying " + selectedAnimalData.animalName);
    const response = await fetch('http://localhost:5001/api/animalsays', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ color: selectedColor, animal: selectedAnimalData.animalName }),
    });
    const sayingJson = await response.json();
    if (sayingJson && sayingJson.length && sayingJson[0].text) {
        let sayingIdx = 0;
        while (thisFetchTime === lastSayingFetchTime) {
            const sayingText = sayingJson[sayingIdx].text;
            console.log("saying is " + sayingText);
            sayingElement.textContent = sayingText;
            ++sayingIdx;
            if (sayingIdx >= sayingJson.length) {
                sayingIdx = 0;
            }
            await wait(3);
        }
    }
}

function setupColorButtons() {
    document.querySelectorAll('.color-button').forEach(button => {
        button.addEventListener('click', function() {
            if (selectedColorButton) {
                selectedColorButton.classList.remove('selected'); // Deselect the previously selected button
            }
            selectedColorButton = button; // Update the selected button reference
            button.classList.add('selected'); // Mark the button as selected
            selectedColor = this.getAttribute('data-color');
        });
    });
}

// showAnimal function remains the same

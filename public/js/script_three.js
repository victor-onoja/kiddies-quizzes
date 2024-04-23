document.addEventListener("DOMContentLoaded", function () {
    function handleFormSubmission(event) {
        event.preventDefault();

        const form = event.target;

        const selectedJewels = form.querySelectorAll('.jewel-card.selected').length;

        if (selectedJewels !== 4) {
            alert('Please select exactly 4 jewels.');
            return;
        }

        const formData = new FormData(form);

        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

        const selectedJewelsIds = Array.from(form.querySelectorAll('.jewel-card.selected')).map(card => card.dataset.id);

        jsonData.jewels = selectedJewelsIds;

        const url = form.getAttribute('action');

        const options = {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        fetch(url, options).then(response => response.json()).then(data => {
            if (data.success) {
                window.location.href = '/home';
            } else {
                alert(data.message);
            }
        }).catch(error => {
            console.error('Form submisssion error:', error);
            alert('An error occured while submitting the form. Please try again later.');
        });
    }

    const form = document.querySelector('form');
    form.addEventListener('submit', handleFormSubmission);
    let selectedJewels = 0;

    function fetchJewels() {
        fetch('/jewels')
            .then(response => response.json())
            .then(data => {
                const jewelsDiv = document.querySelector('.jewel-selection');

                data.forEach(jewel => {
                    const card = document.createElement('div');
                    card.classList.add('jewel-card');
                    card.dataset.id = jewel.id;
                    card.innerHTML = `
                        <img src="${jewel.image}" alt="${jewel.name}">
                        <p>${jewel.name}</p>
                    `;

                    card.addEventListener('click', () => {
                        if (card.classList.contains('selected')) {
                            card.classList.remove('selected');
                            selectedJewels--;
                        } else {
                            if (selectedJewels < 4) {
                                card.classList.add('selected');
                                selectedJewels++;
                            }
                        }
                    });

                    jewelsDiv.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Error fetching jewels:', error);
            });
    }

    fetchJewels();
});

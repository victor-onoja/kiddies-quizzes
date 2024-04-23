document.addEventListener("DOMContentLoaded", function () {
    function handleFormSubmission(event) {
        event.preventDefault();

        const form = event.target;

        const selectedGuardians = form.querySelectorAll('.guardian-card.selected').length;

        if (selectedGuardians !== 2) {
            alert('Please select exactly two guardians.');
            return;
        }

        const formData = new FormData(form);

        const jsonData = {};
        formData.forEach((value, key) => {
            jsonData[key] = value;
        });

        const selectedGuardiansIds = Array.from(form.querySelectorAll('.guardian-card.selected')).map(card => card.dataset.id);

        jsonData.guardians = selectedGuardiansIds;

        const url = form.getAttribute('action');

        const options = {
            method: 'POST',
            body: JSON.stringify(jsonData),
            headers: {
                'Content-Type': 'application/json'
            }
        };

        fetch(url, options).then(response => {
            if (!response.ok) {
                throw new Error('Failed to submit form');
            }
            window.location.href = '/register_two';
        }).catch(error => {
            console.error('Form submission error:', error);
            alert('An error occurred while submitting the form. Please try again later.');
        });
    }

    const form = document.querySelector('form');
    form.addEventListener('submit', handleFormSubmission);
    let selectedGuardians = 0;

    function fetchGuardians() {

        fetch('/guardians')
            .then(response => response.json())
            .then(data => {
                const guardiansDiv = document.querySelector('.guardians');

                data.forEach(guardian => {
                    const card = document.createElement('div');
                    card.classList.add('guardian-card');
                    card.dataset.id = guardian.id;
                    card.innerHTML = `
                        <img src="${guardian.image}" alt="${guardian.name}">
                        <p>${guardian.name}</p>
                    `;

                    card.addEventListener('click', () => {
                        if (card.classList.contains('selected')) {
                            card.classList.remove('selected');
                            selectedGuardians--;
                        } else {
                            if (selectedGuardians < 2) {
                                card.classList.add('selected');
                                selectedGuardians++;
                            }
                        }
                    });
                    guardiansDiv.appendChild(card);
                });
            })
            .catch(error => {
                console.error('Error fetching guardians:', error);
            });
    }

    fetchGuardians();

});


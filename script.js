document.getElementById('fx-tool-form').addEventListener('submit', async function(event) {
    event.preventDefault();
    const date = document.getElementById('date').value;
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = 'Processing... Please wait for 3-4 minutes.';

    try {
        const response = await fetch('http://localhost:3000/fetch-data', {  // Local backend URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ date })
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'historical_rates.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            messageDiv.innerHTML = 'File downloaded successfully.';
        } else {
            messageDiv.innerHTML = 'Error fetching data. Please try again.';
        }
    } catch (error) {
        console.error('Error:', error);
        messageDiv.innerHTML = 'Error fetching data. Please try again.';
    }
});

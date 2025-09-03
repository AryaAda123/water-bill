const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const fetch = require('node-fetch'); // Use 'node-fetch' for making API calls

const app = express();
const PORT = 3000;

// Replace with your Apps Script URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFTa1j9dqdp3WP49Nzxw_diO8HYbNd7RoDeOeOdRVsZUFKsdS34kUWN526ErTVKk_s/exec'; 

app.set('view engine', 'ejs');
app.use(express.static('public')); // For CSS/JS
app.use(bodyParser.urlencoded({ extended: true }));

// Route for the homepage (entering bill ID)
app.get('/', (req, res) => {
    res.render('index', { error: null, bill: null });
});

// Route to fetch and display bill details
app.post('/find-bill', async (req, res) => {
    const { billId } = req.body;
    if (!billId) {
        return res.render('index', { error: 'Please enter a Bill ID.', bill: null });
    }

    try {
        const response = await fetch(`${APPS_SCRIPT_URL}?id=${billId}`);
        const data = await response.json();

        if (data.id) {
            res.render('bill', { bill: data });
        } else {
            res.render('index', { error: 'Bill not found.', bill: null });
        }
    } catch (error) {
        console.error('Error fetching bill:', error);
        res.render('index', { error: 'Something went wrong.', bill: null });
    }
});

// Route to handle payment
app.post('/pay-bill', async (req, res) => {
    const { billId } = req.body;
    try {
        const response = await fetch(`${APPS_SCRIPT_URL}`, {
            method: 'POST',
            body: new URLSearchParams({ id: billId }),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });
        const data = await response.json();

        if (data.includes('Success')) {
            res.render('success');
        } else {
            res.render('index', { error: 'Payment failed.', bill: null });
        }
    } catch (error) {
        console.error('Error processing payment:', error);
        res.render('index', { error: 'Payment failed.', bill: null });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
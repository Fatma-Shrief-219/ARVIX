document.addEventListener('DOMContentLoaded', function() {

    const API_URL = "http://localhost:3000/api"; 

    // ==========================================
    // 1. Sign Up Logic
    // ==========================================
    const signUpForm = document.getElementById('signUpForm');
    if (signUpForm) {
        signUpForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(signUpForm); 

            try {
                const response = await fetch(`${API_URL}/auth/signup`, {
                    method: 'POST',
                    body: formData
                });

                const result = await response.json();

                if (response.ok) {
                    alert('Account created successfully! Please Sign In.');
                    window.location.href = 'sign in page.html';
                } else {
                    alert(result.message || 'Signup failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Connection error. Is the server running?');
            }
        });
    }

    // ==========================================
    // 2. Sign In Logic
    // ==========================================
    const signInForm = document.getElementById('signInForm');
    if (signInForm) {
        signInForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(signInForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const response = await fetch(`${API_URL}/auth/signin`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok) {
                    
                    localStorage.setItem('user', JSON.stringify(result.user));
                    alert(`Welcome back, ${result.user.name}!`);
                    window.location.href = 'Home.Html'; 
                } else {
                    const errorBox = document.getElementById('signInError');
                    if(errorBox) {
                        errorBox.style.display = 'block';
                        errorBox.innerText = result.message;
                    } else {
                        alert(result.message);
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Server connection failed.');
            }
        });
    }

    // ==========================================
    // 3. Become an Owner (Add Car)
    // ==========================================
    const ownerForm = document.getElementById('ownerForm');
    if (ownerForm) {
        ownerForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const formData = new FormData(ownerForm);
            
          
            const policies = [];
            document.querySelectorAll('input[name="policies"]:checked').forEach((checkbox) => {
                policies.push(checkbox.value);
            });
          
            formData.delete('policies'); 
            policies.forEach(p => formData.append('policies[]', p));

            try {
                const response = await fetch(`${API_URL}/cars/add`, {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    alert('Car added successfully!');
                    window.location.href = 'car list2.html'; 
                } else {
                    alert('Failed to add car.');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    }

    // ==========================================
    // 4. Payment Logic
    // ==========================================
    const paymentForm = document.getElementById('payment-form');
    if (paymentForm) {
        
        const urlParams = new URLSearchParams(window.location.search);
        const carId = urlParams.get('carId');
        const price = urlParams.get('price');
        const model = urlParams.get('model');

        if(model) document.getElementById('car-name').innerText = model;
        if(price) document.getElementById('daily-price').innerText = price;
        if(carId) document.getElementById('car-id').value = carId;

       
        setupPaymentCalculations();

        paymentForm.addEventListener('submit', async function(e) {
            e.preventDefault();


            const userJson = localStorage.getItem('user');
            const user = userJson ? JSON.parse(userJson) : null;
            const userId = user ? user.id : null;

            const carIdVal = document.getElementById('car-id').value;
            const numDays = document.getElementById('num-days').value;
            const totalPrice = document.getElementById('total-price').value;
            const cardName = document.getElementById('card-name').value;

            const bookingData = {
                carId: carIdVal,
                userId: userId,
                numDays: numDays,
                totalPrice: totalPrice,
                cardName: cardName
            };

            try {
                const response = await fetch(`${API_URL}/bookings/create`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(bookingData)
                });

                if (response.ok) {
                    alert('Payment Successful! Booking Confirmed.');
                    window.location.href = 'Home.Html';
                } else {
                    alert('Payment failed.');
                }
            } catch (error) {
                console.error('Payment Error:', error);
            }
        });
    }
});

//5 دالة مساعدة لحساب السعر في صفحة الدفع
function setupPaymentCalculations() {
    const incrementBtn = document.getElementById('increment-days');
    const decrementBtn = document.getElementById('decrement-days');
    const numDaysInput = document.getElementById('num-days');
    const totalPriceInput = document.getElementById('total-price');
    const dailyPriceElement = document.getElementById('daily-price');

    if (incrementBtn && decrementBtn && dailyPriceElement) {
        const updatePrice = () => {
            const days = parseInt(numDaysInput.value) || 1;
            const dailyPrice = parseFloat(dailyPriceElement.innerText) || 0;
            if(totalPriceInput) totalPriceInput.value = (days * dailyPrice).toFixed(2);
        };

        incrementBtn.addEventListener('click', () => {
            numDaysInput.value = parseInt(numDaysInput.value) + 1;
            updatePrice();
        });

        decrementBtn.addEventListener('click', () => {
            if (parseInt(numDaysInput.value) > 1) {
                numDaysInput.value = parseInt(numDaysInput.value) - 1;
                updatePrice();
            }
        });
        
       
        updatePrice();
    }
}
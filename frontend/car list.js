document.addEventListener('DOMContentLoaded', function() {
    fetchCars();
});

async function fetchCars() {
    const carsGrid = document.querySelector('.cars-grid');   
    if (!carsGrid) return;

    try {
        const response = await fetch('http://localhost:3000/api/cars');
        const cars = await response.json();

        carsGrid.innerHTML = ''; // مسح أي محتوى قديم

        if (cars.length === 0) {
            carsGrid.innerHTML = '<p style="text-align:center; width:100%;">No cars available right now.</p>';
            return;
        }

        cars.forEach(car => {
            const carCard = document.createElement('div');
            carCard.className = 'car-card'; // نفس الكلاس بتاع الـ CSS بتاعك
            
            carCard.innerHTML = `
                <div class="car-image">
                    <img src="${car.imageUrl}" alt="${car.model}" onerror="this.src='default-car.jpg'">
                    <div class="car-price">$${car.price} <span>/day</span></div>
                </div>
                <div class="car-details">
                    <h3>${car.model}</h3>
                    <p class="owner-name"><i class="fa fa-user"></i> ${car.ownerName}</p>
                    <div class="car-features">
                        <span><i class="fa fa-cogs"></i> ${car.transmission}</span>
                        <span><i class="fa fa-users"></i> ${car.seats}</span>
                        <span><i class="fa fa-tag"></i> ${car.category}</span>
                    </div>
                    <button class="rent-btn" onclick="goToBooking(${car.id}, '${car.model}', ${car.price})">
                        Rent Now
                    </button>
                </div>
            `;
            carsGrid.appendChild(carCard);
        });

    } catch (error) {
        console.error('Error fetching cars:', error);
        carsGrid.innerHTML = '<p>Error loading cars. Please ensure the server is running.</p>';
    }
}

// دالة التوجيه لصفحة الدفع
function goToBooking(id, model, price) {
    // بنبعت بيانات العربية في الرابط عشان صفحة الدفع تقرأها
    window.location.href = `Payment.html?carId=${id}&model=${encodeURIComponent(model)}&price=${price}`;
}
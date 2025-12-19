const express = require('express');
const cors = require('cors');
const { sql, connectToDB } = require('./db');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 


app.use('/uploads', express.static('uploads'));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        
        cb(null, Date.now() + '-' + file.originalname.replace(/\s/g, '_'));
    }
});
const upload = multer({ storage: storage });


connectToDB();
// =======================
//       (Sign Up)
// =======================

app.post('/api/auth/signup', upload.fields([{ name: 'drivingLicense' }, { name: 'idCard' }]), async (req, res) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        const licensePath = req.files['drivingLicense'] ? req.files['drivingLicense'][0].path : null;
        const idPath = req.files['idCard'] ? req.files['idCard'][0].path : null;

        const request = new sql.Request();
        
        await request.query(`
            INSERT INTO Users (FirstName, LastName, Email, PasswordHash, DrivingLicensePath, IDCardPath)
            VALUES (N'${firstName}', N'${lastName}', '${email}', '${password}', '${licensePath}', '${idPath}')
        `);

        res.status(201).json({ message: "Account created successfully!" });
    } catch (err) {
        console.error("Error in Signup:", err);
        if(err.number === 2627) { 
            return res.status(400).json({ message: "This email is already registered." });
        }
        res.status(500).json({ message: "Server error during signup." });
    }
});
//================
// 2.(Sign In)
//================
app.post('/api/auth/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const request = new sql.Request();

        const result = await request.query(`
            SELECT * FROM Users WHERE Email = '${email}' AND PasswordHash = '${password}'
        `);







       // where id == idcard الي متخزنه فال داتا بيز قبل كدا








       
        if (result.recordset.length > 0) {
            const user = result.recordset[0];
            
            res.json({ 
                message: "Login successful", 
                user: { id: user.UserID, name: user.FirstName, email: user.Email } 
            });
        } else {
            res.status(401).json({ message: "Invalid email or password." });
        }
    } catch (err) {
        console.error("Error in Signin:", err);
        res.status(500).json({ message: "Server error." });
    }
});
//=======================
// 3.(Become an Owner)
//=======================
app.post('/api/cars/add', upload.single('car-image'), async (req, res) => {
    try {
        const ownerName = req.body['owner-name'];
        const { model, category, price, transmission, seats } = req.body;
        
        let policies = req.body.policies || '';
        if (Array.isArray(policies)) {
            policies = policies.join(', ');
        }

        const imagePath = req.file ? req.file.path : null;

        const request = new sql.Request();
        
        await request.query(`
            INSERT INTO Cars (OwnerName, Model, Category, Price, Transmission, Seats, Policies, ImagePath)
            VALUES (N'${ownerName}', N'${model}', N'${category}', ${price}, '${transmission}', N'${seats}', N'${policies}', '${imagePath}')
        `);

        res.status(201).json({ message: "Car added successfully!" });
    } catch (err) {
        console.error("Error adding car:", err);
        res.status(500).json({ message: "Error adding car." });
    }
});
//===================
// 4. (Car List)
//===================
app.get('/api/cars', async (req, res) => {
    try {
        const request = new sql.Request();
        const result = await request.query("SELECT * FROM Cars WHERE IsAvailable = 1 ORDER BY CreatedAt DESC");
        
        const cars = result.recordset.map(car => {
            let imgUrl = 'default-car.jpg'; 
            if (car.ImagePath) {
               
                imgUrl = `http://localhost:${PORT}/${car.ImagePath.replace(/\\/g, '/')}`;
            }
            return {
                id: car.CarID,
                model: car.Model,
                price: car.Price,
                category: car.Category,
                seats: car.Seats,
                transmission: car.Transmission,
                imageUrl: imgUrl,
                ownerName: car.OwnerName
            };
        });
        
        res.json(cars);
    } catch (err) {
        console.error("Error fetching cars:", err);
        res.status(500).json({ message: "Error fetching cars." });
    }
});
//=======================
// 5.(Payment)
//=======================
app.post('/api/bookings/create', async (req, res) => {
    try {
        const { carId, userId, numDays, totalPrice, cardName } = req.body;

        const request = new sql.Request();
        await request.query(`
            INSERT INTO Bookings (CarID, UserID, NumDays, TotalPrice, CardHolderName, Status)
            VALUES (${carId}, ${userId || 'NULL'}, ${numDays}, ${totalPrice}, N'${cardName}', 'Confirmed')
        `);

      // دي عشان حته ان لما بناجرها تتشال من ال عربيات المتاحه
       await request.query(`UPDATE Cars SET IsAvailable = 0 WHERE CarID = ${carId}`);

        res.status(201).json({ message: "Booking confirmed!" });
    } catch (err) {
        console.error("Error booking:", err);
        res.status(500).json({ message: "Booking failed." });
    }
});


app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📂 Uploads folder is accessible at http://localhost:${PORT}/uploads`);
});

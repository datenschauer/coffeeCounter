const express =require('express');
const router = express.Router();

router.get('/home', (req, res, next) => {
    res.render('home');
})
router.post('/add-coffee', (req, res, next) => {
    console.log(req.body);
    res.redirect('/thanks');
})
router.get('/thanks', (req, res, next) => {
   res.send('THANKS');
})
router.get('/', (req, res, next) => {
    res.render('index');
})

module.exports = router;

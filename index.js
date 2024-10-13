import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const apiKey = "YourApiKey";
var currentRandomDishID = 0;
var currentMenuSelected = "Random Recipes";
var SearchedDishResults = [];

async function getDishInfo(array) {
    const validDishes = [];

    for (let i = 0; i < array.length; i++) {
        const dish = array[i];
        try {
            const info = await axios.get(`https://api.spoonacular.com/recipes/${dish.id}/information?apiKey=${apiKey}&includeNutrition=false&addWinePairing=false&addTasteData=false`);
        
            validDishes.push(info.data);

        } catch (error) {
            console.error(`Dish with ID ${dish.id} does not exist or an error occurred.`);
            array.splice(i, 1);
            i--;
        };
    };

    return validDishes;
};

app.get('/', async (req,res) => {
    if(currentMenuSelected === "Random Recipes"){
        try {
            const RandDish = await axios.request(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}`);
            currentRandomDishID = RandDish.data.recipes[0].id;
            res.render('index.ejs',{RandRecipe: RandDish.data.recipes[0], CurrentMenu: currentMenuSelected});
        } catch (error) {
            console.error(error);
        };
    } else if(currentMenuSelected === "Search Recipes"){
        if(SearchedDishResults[0]){
            const DishDetailedInfo = await getDishInfo(SearchedDishResults);
            res.render('index.ejs',{SearchResults: SearchedDishResults, DishDetails: DishDetailedInfo, CurrentMenu: currentMenuSelected});
            SearchedDishResults = [];
        } else{
            res.render('index.ejs', {CurrentMenu: currentMenuSelected});
        };
    };
});

app.get('/autocomplete', async (req, res) => {
    const query = req.query.query;
    try {
        const apiResponse = await axios.get(`https://api.spoonacular.com/recipes/autocomplete?apiKey=${apiKey}&number=10&query=${query}`);

        const suggestions = [];

        await apiResponse.data.forEach(suggestion => {
            suggestions.push(suggestion.title);
        });

        res.json(suggestions);
    } catch (error) {
        console.error('Error fetching autocomplete suggestions:', error);
        res.status(500).json({ error: 'Failed to fetch suggestions' });
    }
});

app.post('/menu', (req,res) => {
    const menuChoice = req.body.menuChoice;
    currentMenuSelected = menuChoice;
    res.redirect('/');
});

app.post('/searchDish', async (req,res) => {
    const wantedDish = req.body.WantedDish;
    try{
        const result = await axios.get(`https://api.spoonacular.com/food/menuItems/search?apiKey=${apiKey}&query=${wantedDish}&number=10`);
        await result.data.menuItems.forEach(dish => {
            SearchedDishResults.push(dish);
        });
        currentMenuSelected = "Search Recipes";
        res.redirect('/');
    } catch(error){
        console.error(error);
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
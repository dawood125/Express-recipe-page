const { log } = require("console");
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

let recipes = [
  {
    id: uuidv4(),
    title: "Chicken Biryani",
    description:
      "A fragrant and flavorful Pakistani rice dish with tender spiced chicken, perfect for special occasions and family gatherings.",
    ingredients: [
      "Basmati rice",
      "Chicken",
      "Yogurt",
      "Onions",
      "Spices",
      "Saffron",
    ],
    instructions: [
      "Marinate the chicken with yogurt and spices for at least 2 hours",
      "Wash and soak the basmati rice for 30 minutes",
      "Cook the rice until it's 70% done, then drain",
      "Layer the marinated chicken and partially cooked rice in a heavy-bottomed pot",
      "Add saffron dissolved in milk and fried onions between the layers",
      "Cover with a tight lid and cook on low heat for 20-25 minutes",
      "Let it rest for 10 minutes before serving",
    ],
    cookingTime: "60 minutes",
    category: "Main Course",
    image:
      "https://media.istockphoto.com/id/2156061746/photo/closeup-of-chicken-biryani-dish-served-on-a-wooden-table.webp?a=1&b=1&s=612x612&w=0&k=20&c=-op9UNKbVJBg-XsEgeRfhbL8LkevHcjoF-gsQhGUTo8=",
  },
  {
    id: uuidv4(),
    title: "Chocolate Cake",
    description:
      "Rich and moist chocolate cake that's perfect for birthdays and celebrations. A crowd-pleasing dessert everyone will love. And it is also my personal favorite dish.",
    ingredients: [
      "All-purpose flour",
      "Cocoa powder",
      "Sugar",
      "Eggs",
      "Butter",
      "Milk",
      "Baking powder",
      "Vanilla extract",
    ],
    instructions: [
      "Preheat oven to 350°F and grease your cake pans",
      "Mix all dry ingredients (flour, cocoa, sugar, baking powder) in a large bowl",
      "In another bowl, whisk together eggs, melted butter, milk, and vanilla",
      "Gradually add wet ingredients to dry ingredients, mixing until smooth",
      "Pour batter into prepared pans and bake for 25-30 minutes",
      "Cool completely before frosting",
    ],
    cookingTime: "45 minutes",
    category: "Dessert",
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400",
  },
  {
    id: uuidv4(),
    title: "Caesar Salad",
    description:
      "Classic crispy romaine salad with creamy caesar dressing and parmesan cheese. Light, fresh, and satisfying.",
    ingredients: [
      "Romaine lettuce",
      "Croutons",
      "Parmesan cheese",
      "Caesar dressing",
      "Black pepper",
      "Lemon wedges",
    ],
    instructions: [
      "Wash and chop romaine lettuce into bite-sized pieces",
      "Place lettuce in a large salad bowl",
      "Add croutons and grated parmesan cheese",
      "Drizzle with caesar dressing",
      "Toss everything together until well coated",
      "Serve immediately with lemon wedges and extra parmesan",
    ],
    cookingTime: "10 minutes",
    category: "Salad",
    image: "https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400",
  },
  {
    id: uuidv4(),
    title: "Beef Karahi",
    description:
      "A spicy and aromatic Pakistani curry cooked in a traditional karahi with tender beef pieces and fresh herbs.",
    ingredients: [
      "Beef (cut into pieces)",
      "Tomatoes",
      "Green chilies",
      "Ginger-garlic paste",
      "Red chili powder",
      "Turmeric",
      "Coriander seeds",
      "Fresh coriander",
      "Oil",
    ],
    instructions: [
      "Heat oil in a karahi or heavy-bottomed pan",
      "Add beef pieces and cook until browned on all sides",
      "Add ginger-garlic paste and cook for 2 minutes",
      "Add chopped tomatoes, green chilies, and all spices",
      "Cook on medium heat for 30-40 minutes until beef is tender",
      "Garnish with fresh coriander and serve hot with naan or rice",
    ],
    cookingTime: "50 minutes",
    category: "Main Course",
    image:
      "https://media.istockphoto.com/id/2164442801/photo/chicken-karahi-with-ginger.webp?a=1&b=1&s=612x612&w=0&k=20&c=MINSuchQbWNcwiPOnKn_NxEegZtX9p8Yu3bm-buPldA=",
  },
];

app.get("/recipes", (req, res) => {
  res.render("index.ejs", { recipes });
});

app.get("/recipes/new", (req, res) => {
  res.render("new.ejs");
});

app.get("/recipes/:id", (req, res) => {
  let { id } = req.params;
  let recipe = recipes.find((recipe) => id === recipe.id);
  if (!recipe) {
    return res.status(404).render("404.ejs");
  }
  res.render("show.ejs", { recipe });
});

app.post("/recipes", (req, res) => {
  let { title, description, ingredients, instructions, cookingTime, category, image } = req.body;
  
  let ingredientsArray = ingredients.split('\n').filter(item => item.trim() !== '');
  let instructionsArray = instructions.split('\n').filter(item => item.trim() !== '');
  
  let imagePath = image.startsWith('/') ? image : `/images/${image}`;

  let newRecipe = {
    id: uuidv4(),
    title,
    description,
    ingredients: ingredientsArray,
    instructions: instructionsArray,
    cookingTime,
    category,
    image: imagePath
  };
  
  recipes.push(newRecipe);
  
  res.redirect("/recipes");
});

app.get("/recipes/:id/edit", (req, res) => {
  let { id } = req.params;
  let recipe = recipes.find((recipe) => id === recipe.id);
  res.render("edit.ejs", { recipe });
});

app.patch("/recipes/:id",(req, res)=>{
    let {id}=req.params;
    let { title, description, ingredients, instructions, cookingTime, category, image } = req.body;
    let recipe = recipes.find((recipe) => id === recipe.id);

    let ingredientsArray = ingredients.split('\n').filter(item => item.trim() !== '');
    let instructionsArray = instructions.split('\n').filter(item => item.trim() !== '');


    recipe.title = title;
    recipe.description = description;
    recipe.ingredients = ingredientsArray;
    recipe.instructions = instructionsArray;
    recipe.cookingTime = cookingTime;
    recipe.category = category;
    if (image && image.trim() !== '') {
    let imagePath = image.startsWith('/') ? image : `/images/${image}`;
    recipe.image = imagePath;
    }
    res.redirect(`/recipes/${id}`);
});


app.delete("/recipes/:id", (req, res) => {
  let { id } = req.params;
  recipes = recipes.filter((recipe) => id != recipe.id);
  res.redirect(`/recipes`);
});


app.listen(port, () => {
  console.log(`The port is listening on ${port}`);
});

const { log } = require("console");
const express = require("express");
const app = express();
const port = 3000;
const path = require("path");
const methodOverride = require("method-override");
const { v4: uuidv4 } = require("uuid");
const mysql = require("mysql2/promise");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

async function main() {
  const connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "recipes_db",
  });

  app.get("/recipes", async (req, res) => {
    try {
      const [rows] = await connection.query("SELECT * FROM recipes");
      const recipes = rows.map((recipe) => ({
        ...recipe,
        ingredients: JSON.parse(recipe.ingredients),
        instructions: JSON.parse(recipe.instructions),
      }));
      res.render("index.ejs", { recipes });
    } catch (err) {
      console.error("Error fetching recipes:", err);
      res.status(500).send("Error fetching recipes");
    }
  });

  app.get("/recipes/new", (req, res) => {
    res.render("new.ejs");
  });

  app.get("/recipes/:id", async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await connection.query(
        "SELECT * FROM recipes WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).render("404.ejs");
      }
      const recipe = rows[0];
      recipe.ingredients = JSON.parse(recipe.ingredients);
      recipe.instructions = JSON.parse(recipe.instructions);
      res.render("show.ejs", { recipe });
    } catch (err) {
      console.error("Error fetching recipe:", err);
      res.status(500).send("Error fetching recipe");
    }
  });

  app.post("/recipes", async (req, res) => {
    try {
      let {
        title,
        description,
        ingredients,
        instructions,
        cookingTime,
        category,
        image,
      } = req.body;

      let ingredientsArray = ingredients
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "");
      let instructionsArray = instructions
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      let imagePath = image.startsWith("/") ? image : `/images/${image}`;

      const id = uuidv4();

      await connection.query(
        `INSERT INTO recipes (id, title, description, ingredients, instructions, cookingTime, category, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          title,
          description,
          JSON.stringify(ingredientsArray),
          JSON.stringify(instructionsArray),
          cookingTime,
          category,
          imagePath,
        ]
      );

      res.redirect("/recipes");
    } catch (err) {
      console.error("Error adding new recipe:", err);
      res.status(500).send("Error adding new recipe");
    }
  });

  app.get("/recipes/:id/edit", async (req, res) => {
    const { id } = req.params;
    try {
      const [rows] = await connection.query(
        "SELECT * FROM recipes WHERE id = ?",
        [id]
      );
      if (rows.length === 0) {
        return res.status(404).render("404.ejs");
      }
      const recipe = rows[0];
      recipe.ingredients = JSON.parse(recipe.ingredients);
      recipe.instructions = JSON.parse(recipe.instructions);
      res.render("edit.ejs", { recipe });
    } catch (err) {
      console.error("Error fetching recipe for edit:", err);
      res.status(500).send("Error fetching recipe for edit");
    }
  });

  app.patch("/recipes/:id", async (req, res) => {
    const { id } = req.params;
    try {
      let {
        title,
        description,
        ingredients,
        instructions,
        cookingTime,
        category,
        image,
      } = req.body;

      let ingredientsArray = ingredients
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "");
      let instructionsArray = instructions
        .split("\n")
        .map((item) => item.trim())
        .filter((item) => item !== "");

      let imagePath =
        image && image.trim() !== ""
          ? image.startsWith("/")
            ? image
            : `/images/${image}`
          : null;

      let updateQuery = `UPDATE recipes SET 
      title = ?, 
      description = ?, 
      ingredients = ?, 
      instructions = ?, 
      cookingTime = ?, 
      category = ?`;

      let queryParams = [
        title,
        description,
        JSON.stringify(ingredientsArray),
        JSON.stringify(instructionsArray),
        cookingTime,
        category,
      ];

      if (imagePath) {
        updateQuery += `, image = ?`;
        queryParams.push(imagePath);
      }

      updateQuery += ` WHERE id = ?`;
      queryParams.push(id);

      await connection.query(updateQuery, queryParams);
      res.redirect(`/recipes/${id}`);
    } catch (err) {
      console.error("Error updating recipe:", err);
      res.status(500).send("Error updating recipe");
    }
  });

  app.delete("/recipes/:id", async (req, res) => {
    const { id } = req.params;
    try {
      await connection.query("DELETE FROM recipes WHERE id = ?", [id]);
      res.redirect("/recipes");
    } catch (err) {
      console.error("Error deleting recipe:", err);
      res.status(500).send("Error deleting recipe");
    }
  });
}

main();

app.listen(port, () => {
  console.log(`The port is listening on ${port}`);
});

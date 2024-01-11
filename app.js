import express from "express";
import path from "path";
import fs, { readFile } from "fs";

const readResource = (resourceName) => {
  const data = fs.readFileSync(
    path.resolve(`./databases/${resourceName}.json`)
  );
  const resource = JSON.parse(data);
  return resource;
};

// impostare server ------------------
const app = express();
app.listen(3000, () => {
  console.log("ttappost");
});
app.use(express.json());

// 1.⁠ ⁠Lettura di tutti autori
// GET -------------------------------
app.get("/authors", (req, res) => {
  res.sendFile(path.resolve("./databases/authors.json"));
});

//  2.⁠ ⁠Lettura di un autore singolo (tramite id)
// GET -------------------------------
app.get("/authors/:id", (req, res) => {
  const { id } = req.params;
  const authors = readResource("authors");
  const author = authors.filter((aut) => aut.id === Number(id))[0];
  if (!author) {
    res.status(404).send(`Author with id:${id} not found`);
    return;
  }
  res.send(author);
});

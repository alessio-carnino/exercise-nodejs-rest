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

const writeResource = (resourceName, resource) => {
  const data = JSON.stringify(resource);
  fs.writeFileSync(path.resolve(`./databases/${resourceName}.json`), data);
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

// 3.⁠ ⁠Creazione di un autore
// POST -------------------------------
app.post("/authors", (req, res) => {
  let newAuthor = req.body;
  let isValid = true;
  ["name", "surname", "birthdate", "address"].forEach((key) => {
    isValid &= newAuthor[key] !== undefined;
  });

  if (!isValid) {
    res.status(400).send(`Information missing`);
    return;
  }

  const authors = readResource("authors");
  newAuthor = { id: authors.length + 1, ...newAuthor }; // per mettere l'id come prima key?????
  authors.push(newAuthor);
  writeResource("authors", authors);
  res.send(authors);
});

// 4.⁠ ⁠Aggiornamento di dati di un autore
// PUT -------------------------------
app.put("/authors/:id", (req, res) => {
  const { id } = req.params;
  const newAuthor = req.body;
  const authors = readResource("authors");
  const author = authors.filter((aut) => aut.id === Number(id))[0];
  if (!author) {
    res.status(404).send(`Author with id:${id} not found`);
    return;
  }
  const updatedAuthor = {
    ...author,
    ...newAuthor,
  };

  const authorIndex = authors.findIndex((aut) => aut.id === id); // NOT WORKING ----------
  authors.splice(authorIndex, 1, updatedAuthor); // NOT WORKING ----------

  writeResource("authors", authors);
  res.send("Author updated!!");
});

//   5.⁠ ⁠Eliminazione di un autore
// DELETE -------------------------------

app.delete("/authors/:id", (req, res) => {
  const { id } = req.params;
  const authors = readResource("authors");
  const author = authors.filter((aut) => aut.id === Number(id))[0];
  if (!author) {
    res.status(404).send(`Author with id:${id} not found`);
    return;
  }
  const authorIndex = authors.findIndex((aut) => aut.id === id); // NOT WORKING ----------
  authors.splice(authorIndex, 1); // NOT WORKING ----------

  writeResource("authors", authors);
  res.send("Author deleted");
});

import express from "express";
import path from "path";
import fs, { readFile, write } from "fs";

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

const getSingleResource = (resourceName, req, res) => {
  const { id } = req.params;
  const resource = readResource(resourceName);
  let resourceIndex;
  for (let i = 0; i < resource.length; i++) {
    const element = resource[i];
    if (Number(element.id) === Number(id)) {
      resourceIndex = i;
      break;
    }
  }
  if (resourceIndex === undefined) {
    res.status(404).send(`There is no ${resourceName} resource with id ${id}.`);
    return [];
  }
  return [resource[resourceIndex], resourceIndex];
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
  newAuthor = { id: Number(authors.length + 1), ...newAuthor }; // per mettere l'id come prima key?????
  authors.push(newAuthor);
  writeResource("authors", authors);
  res.send(authors);
});

// 4.⁠ ⁠Aggiornamento di dati di un autore
// PUT /authors/:id {}  -------------------------------
app.put("/authors/:id", (req, res) => {
  let newAuthor = req.body;
  let isValid = true;
  isValid &= Object.keys(newAuthor).length === 4;
  if (isValid) {
    ["name", "surname", "birthdate", "address"].forEach((key) => {
      isValid &= newAuthor[key] !== undefined;
    });
  }
  if (!isValid) {
    res.status(400).send(`Information missing`);
    return;
  }
  const [, indexToUpdate] = getSingleResource("authors", req, res);
  const authors = readResource("authors");
  newAuthor.id = req.params.id;
  authors[indexToUpdate] = newAuthor;
  writeResource("authors", authors);
  res.send(newAuthor);
});

// PATCH /authors/:id {} -------------------------------

app.patch("/authors/:id", (req, res) => {
  let newProperties = req.body;
  let isPropertiesValid = Object.keys(newProperties).length <= 4;
  Object.keys(newProperties).forEach((key) => {
    isPropertiesValid &= ["name", "surname", "birthdate", "address"].includes(
      key
    );
  });
  if (!isPropertiesValid) {
    res
      .status(400)
      .send(`Properties must be only 4: name, surname, birthdate, address`);
    return;
  }
  const [, indexToUpdate] = getSingleResource("authors", req, res);
  const authors = readResource("authors");
  authors[indexToUpdate] = { ...authors[indexToUpdate], ...newProperties };
  writeResource("authors", authors);
  res.send(authors[indexToUpdate]);
});

//   5.⁠ ⁠Eliminazione di un autore
// DELETE -------------------------------

app.delete("/authors/:id", (req, res) => {
  const { id } = req.params;
  const authors = readResource("authors");
  let indexToDelete;
  for (let i = 0; i < authors.length; i++) {
    const author = authors[i];
    if (author.id === Number(id)) {
      indexToDelete = i;
      break;
    }
  }
  if (indexToDelete === undefined) {
    res.status(404).send(`Author with id:${id} not found`);
    return;
  }
  authors.splice(indexToDelete, 1);
  writeResource("authors", authors);
  res.send(`Author with id:${id} deleted correctly.`);
});

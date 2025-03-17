const express = require("express");

const { sequelize, Author, Book, Genre } = require("./models");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello World!");
});

// Seed the database with dummy data
app.get("/seed_db", async (req, res) => {
    try {
        await sequelize.sync({ force: true });

        // Seed Authors
        const authors = await Author.bulkCreate([
            {
                name: "J.K. Rowling",
                birthdate: "1965-07-31",
                email: "jkrowling@books.com",
            },
            {
                name: "George R.R. Martin",
                birthdate: "1948-09-20",
                email: "grrmartin@books.com",
            },
        ]);

        // Seed Genres
        const genres = await Genre.bulkCreate([
            { name: "Fantasy", description: "Magical and mythical stories." },
            {
                name: "Drama",
                description: "Fiction with realistic characters and events.",
            },
        ]);

        // Seed Books
        const books = await Book.bulkCreate([
            {
                title: "Harry Potter and the Philosopher's Stone",
                description: "A young wizard's journey begins.",
                publicationYear: 1997,
                authorId: authors[0].id,
            },
            {
                title: "Game of Thrones",
                description: "A medieval fantasy saga.",
                publicationYear: 1996,
                authorId: authors[1].id,
            },
        ]);

        // Set up relationships between Books and Genres
        await books[0].setGenres([genres[0]]);
        await books[1].setGenres([genres[0], genres[1]]);

        res.status(200).json({ message: "Database seeded successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error seeding database" });
    }
});

// Get All Books
app.get("/books", async (req, res) => {
    try {
        const books = await Book.findAll({ include: [Author, Genre] });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books" });
    }
});

// Get All Books Written by an Author
app.get("/authors/:authorId/books", async (req, res) => {
    try {
        const author = await Author.findByPk(req.params.authorId, {
            include: Book,
        });
        if (!author)
            return res.status(404).json({ message: "Author not found" });
        res.status(200).json(author.Books);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by author" });
    }
});

// Get Books by Genre
app.get("/genres/:genreId/books", async (req, res) => {
    try {
        const genre = await Genre.findByPk(req.params.genreId, {
            include: Book,
        });
        if (!genre) return res.status(404).json({ message: "Genre not found" });
        res.status(200).json(genre.Books);
    } catch (error) {
        res.status(500).json({ message: "Error fetching books by genre" });
    }
});

// Add a New Book
app.post("/books", async (req, res) => {
    const { title, description, publicationYear, authorId, genreIds } =
        req.body;

    try {
        // Check if author exists
        const author = await Author.findByPk(authorId);
        if (!author)
            return res.status(404).json({ message: "Author not found" });

        // Create new book
        const newBook = await Book.create({
            title,
            description,
            publicationYear,
            authorId,
        });

        // Associate genres with the new book
        const genres = await Genre.findAll({ where: { id: genreIds } });
        if (genres.length === 0)
            return res.status(404).json({ message: "Invalid genres" });

        await newBook.setGenres(genres);

        res.status(201).json(newBook);
    } catch (error) {
        res.status(500).json({ message: "Error adding book" });
    }
});

const PORT = process.env.PORT || 5000;
sequelize.sync().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});

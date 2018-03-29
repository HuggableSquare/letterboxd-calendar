const request = require('request-promise');
const cheerio = require('cheerio');

const express = require('express');
const app = express();

app.get('/diary/:user', async function (req, res) {
	try {
		let movies = [];
		let pages = [];

		const initial = await request(`https://letterboxd.com/${req.params.user}/films/diary/`);
		pages.push(initial);

		let $ = cheerio.load(initial);
		const newPages = await Promise.all($('.paginate-page > a').map((index, el) => request('https://letterboxd.com' + $(el).attr('href'))).get());

		pages = pages.concat(newPages);
		pages.forEach((page) => {
			$ = cheerio.load(page);
			movies = movies.concat($('.edit-review-button').map((index, el) => {
				let data = $(el).data();
				data.targetLink = $('.film-poster').eq(index).data('target-link');
				return data;
			}).get());
		});
		return res.json(movies);
	} catch (e) {
		if (e.statusCode === 404) {
			return res.status(404).json({ error: { message: 'user not found' } });
		} else {
			return res.status(500).json({ error: { message: 'unknown error occured' } });
		}
	}
});

app.use(express.static('public'));

app.listen(2693, '127.0.0.1');

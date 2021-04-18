const request = require('request-promise');
const cheerio = require('cheerio');

const express = require('express');
const app = express();

app.get('/diary/:user', async function (req, res) {
	try {
		const movies = [];
		let pages = [];

		const initial = await request(`https://letterboxd.com/${req.params.user}/films/diary/`);
		pages.push(initial);

		let $ = cheerio.load(initial);
		const length = parseInt($('.paginate-page:last-child > a').text());
		for (let i = 2; i <= length; i++) {
			pages.push(request(`https://letterboxd.com/${req.params.user}/films/diary/page/${i}/`));
		}

		pages = await Promise.all(pages);
		pages.forEach((page) => {
			$ = cheerio.load(page);
			movies.push(...$('.edit-review-button').map((index, el) => {
				const data = $(el).data();
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

app.listen(2693);

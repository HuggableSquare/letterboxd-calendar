const user = 'huggablesquare';

fetch(`diary/${user}`)
	.then((res) => res.json())
	.then((movies) => {
		$(document).ready(() => {
			$('.loading').hide();
			$('#calendar').fullCalendar({
				allDayDefault: true,
				eventColor: '#2c3641',
				events: movies.map((movie) => {
					return {
						id: movie.viewingId,
						title: movie.filmName,
						start: movie.viewingDate,
						url: 'https://letterboxd.com' + movie.targetLink
					};
				})
			});
		});
	})
	.catch((e) => {
		$('.loading').text('Error.');
	});

module.exports = {
	name: 'error',
	once: true,
	execute(error) {
		console.error(error);
	}
}
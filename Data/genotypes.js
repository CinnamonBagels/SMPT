var data = [
	'AA',
	'AT',
	'AC',
	'AG',
	'TA',
	'TT',
	'TC',
	'TG',
	'CA',
	'CT',
	'CC',
	'CG',
	'GA',
	'GT',
	'GC',
	'GG'
];

module.exports.data = data;

module.exports.generateRandomData = function() {
	var i;
	var randomData = {
		case : [],
		control : []
	};

	data.forEach(function(genotype) {
		randomData.case.push(Math.floor(Math.random() * 1000000) * 34);
	});

	data.forEach(function(genotype) {
		randomData.control.push(Math.floor(Math.random() * 1000000) * 34);
	});

	return randomData;
}
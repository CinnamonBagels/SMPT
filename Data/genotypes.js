module.exports.data = [
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

module.exports.generateRandomData = function() {
	var i;
	var randomData = {
		case : {},
		control : {}
	};

	genotypes.forEach(function(genotype) {
		randomData.case[genotype] = Math.floor(Math.random() * 1000000) * 34;
	});

	genotypes.forEach(function(genotype) {
		randomData.control[genotype] = Math.floor(Math.random() * 1000000) * 34;
	});

	return randomData;
}
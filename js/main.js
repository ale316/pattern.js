Pattern.defineEntities([ 
	{ name:'task', definition: function(word) { 
		if(typeof word == 'string' || word instanceof String) return word;
		else return false;
	} }, 
	{ name:'date', definition: function(word) { 
		var parsed = Date.parse(word);
		if(parsed && (parsed.toString('HH:mm') == '00:00')) return parsed;
		else return false;
	} },
	{ name:'time', definition: function(word) { 
		var parsed = Date.parse(word);
		if(parsed && (parsed.toString('M-d-yyyy') == Date.today().toString('M-d-yyyy')) && (parsed.toString('HH:mm') != '00:00')) return parsed;
		else if(word == '12pm' || word == '12:00pm' || word =='midnight' || word == '00:00') return parsed;
		else return false;
	} },
	{ name:'qualifier', definition: function(str) { 
		var qualifiers = ['by', 'at', 'on', 'between']
		return (qualifiers.indexOf(str) > -1)
	} }
])

Pattern.defineRules([
	'task qualifier date',
	'task qualifier time', 
	'task'
])
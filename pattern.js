var Pattern = (function() {
	"use strict"
	// PRIVATE PROPERTIES
	var _entities = {},
		_rules = { 
			entity: "init",
			accepting: false,
			next: []
		}
	// PUBLIC METHODS
	/*
		input: [{ name: String, definition: function() { return true|false }}]
	*/
	function defineEntities(entities) {
		for (var i = 0; i < entities.length; ++i) {
			var entity = entities[i]
			if(!entity.name) 
				throw "All entities must have a name"
			if(entity.definition && typeof(entity.definition) != "function")
				throw "An entity definition must be a function taking as the only argument a string token"
			if(!entity.definition) {
				entity.definition = function(ent) {
					return ent == entity.name
				}
			}
			_entities[entity.name] = entity.definition
		}
	}

	function defineRules(rulesList) {
		if(rulesList instanceof Array != true)
			throw "The list of rules must be an array"
		for (var i = 0; i < rulesList.length; ++i) {
			var splitRule = rulesList[i].split(' ')
			_defineRule(splitRule, _rules)
		}
	}

	function match(str) {
		if(str.length > 0) {
			var tokens = str.split(' '),
				rules = _rules
			_match(tokens, rules, [])
		}
	}

	// PRIVATE METHODS
	/* a rule is a string of entities: "entity1 entity2 entity1 entity3", for example: "task by date", */
	function _defineRule(rule, rules) {
		if(rule.length <= 0) return
		var first = rule[0],
			rest  = rule.slice(1)
			
		for (var i = 0; i < rules.next.length; i++) {
			if(rules.next[i].entity == first) {
				if(rule.length == 1) {
					rules.next[i].accepting = true
				}
				return _defineRule(rest, rules.next[i])
			}
		}
		var newNode = {
			entity: first,
			accepting: (rule.length == 1),
			next: []
		}
		rules.next.push(newNode)
		return _defineRule(rest, newNode)
	}

	function _match(tokens, currRule, result) {
		if(!result) result = []
		if(tokens.length <= 0) {
			console.log('RESULT FOUND: ', result)
			return currRule.accepting
		}
		var first = tokens[0],
			rest = tokens.slice(1)
		for (var i = 0; i < currRule.next.length; ++i) {
			var entityName = currRule.next[i].entity,
				isEntity = _entities[ entityName ]
			if(isEntity(first)) {
				var newResult = result.slice()
				newResult.push({
					entity: entityName,
					value: first
				})
				_match(rest, currRule.next[i], newResult)
				if(rest.length > 0) {
					var concatenated = rest.slice()
					concatenated[0] = first + ' ' + concatenated[0]
					_match(concatenated, currRule, result)
				}

			}
		}
	}

	return {
		defineEntities: defineEntities,
		defineRules: defineRules,
		rules: _rules,
		entities: _entities,
		match: match
	}
})()
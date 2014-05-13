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

	function defineRules(rules) {
		if(rules instanceof Array != true)
			throw "The list of rules must be an array"
		for (var i = 0; i < rules.length; ++i) {
			var rule = rules[i],
				ruleName, splitRule
			splitRule = rule.split(' ')
			ruleName = rule //splitRule.join('_')
			
			_defineRule(splitRule, _rules, ruleName)
		}
	}

	function match(str) {
		var result = {}
		if(str.length > 0) {
			var tokens = str.split(' '),
				rules = _rules
			_match(tokens, rules, [], function(match, ruleName) {
				result[ruleName] = Match(ruleName.split(' '), match)
			})
			return result
		}
	}

	// PRIVATE METHODS
	/* a rule is a string of entities: "entity1 entity2 entity1 entity3", for example: "task by date", */
	function _defineRule(rule, rules, ruleName) {
		if(rule.length <= 0) return
		var first = rule[0],
			rest  = rule.slice(1),
			isLast = (rule.length == 1)
		for (var i = 0; i < rules.next.length; i++) {
			if(rules.next[i].entity == first) {
				if(isLast) {
					rules.next[i].accepting = true
					rules.next[i].ruleName 	= ruleName
				}
				return _defineRule(rest, rules.next[i], ruleName)
			}
		}
		var newNode = {
			entity: first,
			accepting: isLast,
			next: []
		}
		if(isLast) newNode.ruleName = ruleName
		rules.next.push(newNode)
		return _defineRule(rest, newNode, ruleName)
	}

	function _match(tokens, currRule, result, returnCb) {
		if(!result) result = []
		if(tokens.length <= 0) {
			if(currRule.accepting)
				return returnCb(result, currRule.ruleName)
		}
		var first = tokens[0],
			rest = tokens.slice(1)
		for (var i = 0; i < currRule.next.length; ++i) {
			var entityName = currRule.next[i].entity,
				isEntity = _entities[ entityName ]
			if(isEntity(first)) {
				var newResult = result.slice()
				newResult.push(first)
				_match(rest, currRule.next[i], newResult, returnCb)
				if(rest.length > 0) {
					var concatenated = rest.slice()
					concatenated[0] = first + ' ' + concatenated[0]
					_match(concatenated, currRule, result, returnCb)
				}

			}
		}
	}

	return {
		defineEntities: defineEntities,
		defineRules: defineRules,
		match: match
	}
})()

var Match = function(rule, tokenized) {
	var rule = rule,
		depth = rule.length,
		_arr = tokenized

	function toObject() {
		var _obj = {}
		for (var i = 0; i < rule.length; ++i) {
			var entity = rule[i]
				existingMatch = _obj[entity]
			if(existingMatch) {
				if(existingMatch instanceof Array) {
					_obj[entity].push(tokenized[i])
				} else {
					_obj[entity] = [_obj[entity], tokenized[i]]
				}
			} else {
				_obj[entity] = tokenized[i]
			}
		}

		return _obj
	}

	function toArray() {
		return _arr
	}

	return {
		rule: rule,
		depth: depth,
		toObject: toObject,
		toArray: toArray
	}
}

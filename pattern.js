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
				id, splitRule
			if(typeof rule === 'string') {
				splitRule = rule.split(' ')
				id = splitRule.join('_')
			} else if(typeof rule === 'object') {
				splitRule = rule.definition.split(' ')
				id = rule.id
			}
			
			_defineRule(splitRule, _rules, id)
		}
	}

	function match(str) {
		var result = {}
		if(str.length > 0) {
			var tokens = str.split(' '),
				rules = _rules
			_match(tokens, rules, [], function(task, id) {
				result[id] = task
			})
			return result
		}
	}

	// PRIVATE METHODS
	/* a rule is a string of entities: "entity1 entity2 entity1 entity3", for example: "task by date", */
	function _defineRule(rule, rules, id) {
		if(rule.length <= 0) return
		var first = rule[0],
			rest  = rule.slice(1),
			isLast = (rule.length == 1)
		for (var i = 0; i < rules.next.length; i++) {
			if(rules.next[i].entity == first) {
				if(isLast) {
					rules.next[i].accepting = true
					rules.next[i].id 		= id
				}
				return _defineRule(rest, rules.next[i], id)
			}
		}
		var newNode = {
			entity: first,
			accepting: isLast,
			next: []
		}
		if(isLast) newNode.id = id
		rules.next.push(newNode)
		return _defineRule(rest, newNode, id)
	}

	function _match(tokens, currRule, result, returnCb) {
		if(!result) result = []
		if(tokens.length <= 0) {
			if(currRule.accepting)
				return returnCb(result, currRule.id)
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
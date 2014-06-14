So.. what's this?
=========
`Pattern.js` allows you to match a string against a set of predefined patterns through boolean functions or regular expressions. 

Usage
-----
In order for `pattern.js` to match a given string, you must define the patterns it needs to be able to understand and the entities that make those patterns up. 

You would for example define what a funkyNumber and an operation are through the `Pattern.defineEntities` method as follows:

```javascript
Pattern.defineEntities([
    {
        name: 'funkyNumber',
        definition: function(str) {
            var result = false;
            /* a funkyNumber is an integer of less than 5 digits that is divisible by the sum of its digits.
            Eg: 36 is funky because 36/(3+6) = 4 */
            var intVersion = parseInt(str)
            if(str.length < 5 && !isNaN(intVersion)) {
                var digitsSum = 0;
                for(var i=0; i<str.length; ++i) {
                    digitsSum += parseInt(str[i]);
                }
                if(intVersion % digitsSum == 0) result = true;
            }
            return result;
        }
    },
    /* an operation is simply a string matching + or - or * or / */
    {
        name: 'operation',
        definition: /^(\+|-|\*|\/)$/
    },
    /* this will define the entity = as a string matching the string "=" */
    {
        name:"="
    }
])
```

Now, you can define which patterns to allow as follows:

```javascript
Pattern.definePatterns([
    'funkyNumber operation funkyNumber = funkyNumber', // would match 36 + 300 = 336
    'funkyNumber operation = funkyNumber' // would match 36 * = 300, but not 36 * = 17
])
```
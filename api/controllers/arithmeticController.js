'use strict';

exports.calculate = function(req, res) {
  var operations = {
    'add':      function(a,b) { return +a + +b },
    'subtract': function(a,b) { return a - b },
    'multiply': function(a,b) { return a * b },
    'divide':   function(a,b) { return a / b },
  };

  // Determine the operation

  if (! req.query.operation) {
    return res.status(400).json({ error: "Unspecified operation" });
  }

  var operation = operations[req.query.operation];

  if (! operation) {
    return res.status(400).json({ error: "Invalid operation: " + req.query.operation });
  }

  // Validate operands

  if (! req.query.operand1 ||
      ! req.query.operand1.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand1.replace(/[-0-9e]/g, '').length > 1) {
    return res.status(400).json({ error: "Invalid operand1: " + req.query.operand1 });
  }

  if (! req.query.operand2 ||
      ! req.query.operand2.match(/^(-)?[0-9\.]+(e(-)?[0-9]+)?$/) ||
      req.query.operand2.replace(/[-0-9e]/g, '').length > 1) {
    return res.status(400).json({ error: "Invalid operand2: " + req.query.operand2 });
  }

  res.json({ result: operation(req.query.operand1, req.query.operand2) });
};

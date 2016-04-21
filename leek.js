var Leek = Leek || {};

Leek.topEnv = Object.create(null);

Leek.topEnv["true"] = true;
Leek.topEnv["false"] = false;
Leek.parseExpression = function(program) {
  program = Leek.skipSpace(program);
  var match, expr;
  if (match = /^"([^"]*)"/.exec(program))
    expr = {type: "value", value: match[1]};
  else if (match = /^\d+\b/.exec(program))
    expr = {type: "value", value: Number(match[0])};
  else if (match = /^[^\s(),"]+/.exec(program))
    expr = {type: "word", name: match[0]};
  else
    throw new SyntaxError("Unexpected syntax: " + program);

  return Leek.parseApply(expr, program.slice(match[0].length));
}

 Leek.skipSpace = function(string) {
  var first = string.search(/\S/);
  if (first == -1) return "";
  return string.slice(first);
}
Leek.parseApply = function(expr, program) {
  program = Leek.skipSpace(program);
  if (program[0] != "(")
    return {expr: expr, rest: program};

  program = Leek.skipSpace(program.slice(1));
  expr = {type: "apply", operator: expr, args: []};
  while (program[0] != ")") {
    var arg = Leek.parseExpression(program);
    expr.args.push(arg.expr);
    program = Leek.skipSpace(arg.rest);
    if (program[0] == ",")
      program = Leek.skipSpace(program.slice(1));
    else if (program[0] != ")")
      throw new SyntaxError("Expected ',' or ')'");
  }
  return Leek.parseApply(expr, program.slice(1));
}
Leek.parse =  function(program) {
  var result = Leek.parseExpression(program);
  if (Leek.skipSpace(result.rest).length > 0)
    throw new SyntaxError("Unexpected text after program");
  return result.expr;
}
 Leek.evaluate = function(expr, env) {
  switch(expr.type) {
    case "value":
      return expr.value;

    case "word":
      if (expr.name in env)
        return env[expr.name];
      else
        throw new ReferenceError("Undefined variable: " +
                                 expr.name);
    case "apply":
      if (expr.operator.type == "word" &&
          expr.operator.name in Leek.specialForms)
        return Leek.specialForms[expr.operator.name](expr.args,
                                                env);
      var op = Leek.evaluate(expr.operator, env);
      if (typeof op != "function")
        throw new TypeError("Applying a non-function.");
      return op.apply(null, expr.args.map(function(arg) {
        return Leek.evaluate(arg, env);
      }));
  }
}

Leek.specialForms = Object.create(null);
Leek.specialForms["if"] = function(args, env) {
  if (args.length != 3)
    throw new SyntaxError("Bad number of args to if");

  if (Leek.evaluate(args[0], env) !== false)
    return Leek.evaluate(args[1], env);
  else
    return Leek.evaluate(args[2], env);
};
Leek.specialForms["try"] = function(args,env){
try{
return Leek.evaluate(args[0],env);
}catch(e){
env["err"] = e;
return Leek.evaluate(args[1],env);
}
return false;
};
Leek.specialForms["while"] = function(args, env) {
  if (args.length != 2)
    throw new SyntaxError("Bad number of args to while");

  while (Leek.evaluate(args[0], env) !== false)
    Leek.evaluate(args[1], env);

  // Since undefined does not exist in Egg, we return false,
  // for lack of a meaningful result.
  return false;
};
Leek.specialForms["do"] = function(args, env) {
  var value = false;
  args.forEach(function(arg) {
    value = Leek.evaluate(arg, env);
  });
  return value;
};
Leek.specialForms["define"] = function(args, env) {
  if (args.length != 2 || args[0].type != "word")
    throw new SyntaxError("Bad use of define");
  var value = Leek.evaluate(args[1], env);
  env[args[0].name] = value;
  return value;
};
Leek.topEnv["."] = function(a,b){
return topEnv[a][b];
};
["+", "-", "*", "%","/", "==", "<", ">"].forEach(function(op) {
  Leek.topEnv[op] = new Function("a, b", "return a " + op + " b;");
});
Leek.topEnv["print"] = function(value) {
  console.log(value);
  
  return value;
};
 Leek.getSymcryptE = function(shift,value){
 var Alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
 var ev = ""
  for(var i = 0; i < value.length; i++){
    ev = ev + Alpha[Alpha.indexOf(value[i]) + shift];
	
  }
  return ev
  };
Leek.topEnv["len"] = function(value){
 return value.length;
};
Leek.topEnv["vignere"] = function(shift,value){
   var evalue =  Leek.getSymcryptE(shift,value);
   console.log(evalue);
   return evalue;
};
Leek.topEnv["WCA"] = function(value,mode){

var code2 = "";
 var Alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

if(mode == "encrypt"){
var code1 = Leek.topEnv["vignere"](Math.floor(Math.random() *  + 1),value);

for(var i = 0; i < code1.length; i++){

    code2 = code2 + Alpha.indexOf(code1[i]).toString(16);
	
  }
 }else if(mode == "decrypt"){
 for(var i = 0; i < value.length; i++){

      code2 = code2 + Alpha[Alpha.indexOf(parseInt(value[i],16).toString(10)-10)];
}
  
  }
  console.log(code2);
  return code2;
  
};

 Leek.run = function() {
  var env = Object.create(Leek.topEnv);
try{
  var program = Array.prototype.slice
    .call(arguments, 0).join("\n");
  return Leek.evaluate(Leek.parse(program), env);}
catch(e){
alert(e);
}
}
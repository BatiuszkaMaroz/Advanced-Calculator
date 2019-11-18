let operationsController = (function() {
  let currentValue = '';
  let currentExpression = '';
  let result = 0;
  let afterEvaluate = false;

  function afterEval(number) {
    let sign = currentExpression[currentExpression.length - 2];
    let before = currentExpression.charAt(currentExpression.length - 3);

    if(sign == '+' || (sign == '-' && before == '(') || sign == '/' || sign == '*') {
      currentValue += number;
      currentExpression += number;
      afterEvaluate = false;
    }
    else {
      currentExpression = number;
      result = 0;
      currentValue = number;
    }
  }

  function evalLastChar() {
    let sign = currentExpression[currentExpression.length - 2];

    if(sign == '+' || sign == '-' || sign == '/' || sign == '*') {
      currentExpression = currentExpression.slice(0, currentExpression.length - 2);
    }
    else {
      return;
    }
  }

  return {
    addCurrent: function(number) {
      currentValue = currentValue.toString();
      if(currentValue === '' && number == 0) {
        return;
      }
      else if (afterEvaluate) {
        afterEval(number);
      }
      else {
        currentValue += number;
        currentExpression += number;
      }

      return currentValue;
    },

    changeSign: function(number) {
      let lastChar = currentExpression.toString().charAt(currentExpression.length-1);
      let minus = currentExpression.toString().charAt((currentExpression.length - number.toString().length) - 2);

      if (currentExpression.toString().length == 0) {
        currentExpression += '(' + number + ')';
      }
      else if(minus == '-') {
        currentExpression = currentExpression.toString().slice(0, (currentExpression.length - number.toString().length) - 3);
        currentExpression += '(' + number + ')';
      }
      else if(lastChar == ')') {
        currentExpression = currentExpression.toString().slice(0, currentExpression.length-number.toString().length - 1);
        currentExpression += '(' + number + ')';
      }
      else {
        currentExpression = currentExpression.toString().slice(0, (currentExpression.length - number.toString().length) + 1);
        currentExpression += '(' + number + ')';
      }

      currentValue *= -1;

      return number;
    },

    addToExpression: function(sign) {
      let lastChar = currentExpression.charAt(currentExpression.length - 2);
      let before = currentExpression.charAt(currentExpression.length - 3);
      if(lastChar == '+' || (lastChar == '-' && (before == '(' || before == ' ' )) || lastChar == '*' || lastChar == '/') {
        currentExpression = currentExpression.slice(0, currentExpression.length-3);
      }
      currentExpression += ' ' + sign + ' ';
      currentValue = '';
      return currentExpression;
    },

    evaluate: function() {
      evalLastChar();
      result = eval(currentExpression);
      currentValue = result.toString();
      currentExpression = result.toString();
      afterEvaluate = true;
      return result;
    },

    clearInput: function(current) {
      currentValue = '';
      currentExpression = currentExpression.toString().slice(0, currentExpression.length - current.length);
    },

    clearAll: function() {
      currentValue = '';
      currentExpression = '';
      result = 0;
      afterEvaluate = false;
    },

    backspace: function(current) {
      current = current.toString();
      currentExpression = currentExpression.slice(0, currentExpression.length - 1);

      if(current.length > 0) {
        current = current.slice(0, current.length - 1);
      }
      else {
        current = '';
      }
      currentValue = current;
      afterEvaluate = false;

      return current;
    },

    comma: function() {
      let com = currentValue.toString();
      if (!com.includes('.')) {
        currentValue += '.';
        currentExpression += '.';
      }
      return currentValue;
    },

    test: function() {
      console.log('currentValue:' + currentValue + 'currentExpression:' + currentExpression + 'result:' + result);
    }
  };

})();



let UIController = (function() {
  let DOMStrings = {
    calculatorButton: '.calculator__button',
    input: '.result__input',
    stored: '.result__stored',
  };

  let input = document.querySelector(DOMStrings.input);
  let stored = document.querySelector(DOMStrings.stored);

  return {
    getDOMStrings: function() {
      return DOMStrings;
    },

    updateCurrent: function(current) {
      if(current.length < 1) {
        input.textContent = 0;
      }
      else {
        input.textContent = current;
      }
    },

    addComma: function() {
      input.textContent += '.';
    },

    updateExpression: function(expression, current) {
      stored.textContent = expression;

      let result = expression.toString();
      let sign = result[result.length - 2];

      if(sign == '+' || sign == '-' || sign == '/' || sign == '*') {
        result = result.slice(0, result.length - 2);
      }

      result = eval(result);
      input.textContent = result;
    },

    evalUpdate: function(current) {
      input.textContent = current;
      stored.textContent = '-';
    },

    clearInput: function() {
      input.textContent = 0;
    },

    clearAll: function() {
      this.clearInput();
      stored.textContent = '';
    }
  }
})();



let calculatorController = (function(operationsCtrl, UICtrl) {
  let current, expression;
  let DOM = UIController.getDOMStrings();

  function setEventListeners() {
    let buttons = document.querySelectorAll(DOM.calculatorButton);
    let index = 0;
    buttons.forEach(button => {
      button.addEventListener('click', buttonClick.bind(this, index));
      index++;
    });
  }

  function buttonClick(index) {

    switch(index) {

      //clear
      case 0: {
        current = 0;
        expression = 0;
        operationsCtrl.clearAll();
        UICtrl.clearAll();
        break;
      }
      case 1: {
        operationsCtrl.clearInput(current);
        UICtrl.clearInput();
        current = 0;
        break;
      }
      case 2: {
        current = operationsCtrl.backspace(current);
        UICtrl.updateCurrent(current);
        break;
      }

      //comma
      case 18: {
        current = operationsCtrl.comma();
        UICtrl.updateCurrent(current);
        break;
      }

      //sign
      case 16: {
        current = current * -1;
        current = operationsCtrl.changeSign(current);
        UICtrl.updateCurrent(current);
        break;
      }

      //evaluation
      case 19:
        current = operationsCtrl.evaluate();
        UICtrl.evalUpdate(current);
        break;

      //sign buttons
      case 15:
        expression = operationsCtrl.addToExpression('+');
        UICtrl.updateExpression(expression, current);
        break;
      case 11:
        expression = operationsCtrl.addToExpression('-');
        UICtrl.updateExpression(expression, current);
        break;
      case 7:
        expression = operationsCtrl.addToExpression('*');
        UICtrl.updateExpression(expression, current);
        break;
      case 3:
        expression = operationsCtrl.addToExpression('/');
        UICtrl.updateExpression(expression, current);
        break;

      //number buttons
      case 4:
        current = operationsCtrl.addCurrent(7);
        UICtrl.updateCurrent(current);
        break;
      case 5:
        current = operationsCtrl.addCurrent(8);
        UICtrl.updateCurrent(current);
        break;
      case 6:
        current = operationsCtrl.addCurrent(9);
        UICtrl.updateCurrent(current);
        break;
      case 8:
        current = operationsCtrl.addCurrent(4);
        UICtrl.updateCurrent(current);
        break;
      case 9:
        current = operationsCtrl.addCurrent(5);
        UICtrl.updateCurrent(current);
        break;
      case 10:
        current = operationsCtrl.addCurrent(6);
        UICtrl.updateCurrent(current);
        break;
      case 12:
        current = operationsCtrl.addCurrent(1);
        UICtrl.updateCurrent(current);
        break;
      case 13:
        current = operationsCtrl.addCurrent(2);
        UICtrl.updateCurrent(current);
        break;
      case 14:
        current = operationsCtrl.addCurrent(3);
        UICtrl.updateCurrent(current);
        break;
      case 17:
        current = operationsCtrl.addCurrent(0);
        if(current) {
          UICtrl.updateCurrent(current);
        }
        break;
    }
  }

  return {
    appStart: function() {
      setEventListeners();
    },
  };

})(operationsController, UIController);

calculatorController.appStart();

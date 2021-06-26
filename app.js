/************* Budget Controller */
    var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalIncome) {
        this.percentage = Math.round((this.value / totalIncome) * 100);
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };
    
    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        Data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        Data.totals[type] = sum;
    };

    var Data = {
        allItems: {
            exp: [],
            inc: [],
        },

        totals: {
            exp: [],
            inc:  [],
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItems: function (type, des, val) {
            var newItem, ID;
            // Create new ID
            if (Data.allItems[type].length > 0) {
                ID = Data.allItems[type][Data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            };
            
            // Push it into our data structure
            Data.allItems[type].push(newItem);

            // the new element 
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = Data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(id);
            if (index !== -1 ) {
                Data.allItems[type].splice(index, 1);
            };
        },

        calculateBudget: function () {
            // calculate total income and expenses
            calculateTotal('exp');
            calculateTotal('inc');

            // calculate the budget: income - expenses
            Data.budget = Data.totals.inc - Data.totals.exp;

             // calculate the budget: income - expenses
            if (Data.totals.inc > 0) {
                Data.percentage = Math.round((Data.totals.exp / Data.totals.inc ) * 100);
            } else {
                Data.percentage = -1;
            }
        
        },

        calculatePercentage: function () {
            Data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(Data.totals.inc);
            });
        },

        getPercentage: function () {
            var allPerc = Data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function () {
            return {
                budget: Data.budget,
                totalInc: Data.totals.inc,
                totalExp: Data.totals.exp,
                percentage: Data.percentage
            }
        },

        testing: function () {
            console.log(Data);
        },
    };
})();



/************** UI Controller */
var UIController = (function () {
    
    var DOMstring = {
        addType: '.add__type',
        addDescription: '.add__description',
        addValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3 ) + ',' + int.substr(int.length - 3, 3);
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (let i = 0; i < list.length; i++) {
            callback(list[i], i)
        }
    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstring.addType).value,   // for inc or exp
                description: document.querySelector(DOMstring.addDescription).value,
                value: parseFloat(document.querySelector(DOMstring.addValue).value )
            }
        },

        addListItem: function (obj, type) {
            var html, newHtml, element;
            // Create HTML string with placeholder text
            if (type === 'inc') {
                element = DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstring.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } 
        
            // Replace the placeholder text with some actual data 
                newHtml = html.replace('%id%', obj.id);
                newHtml = newHtml.replace('%description%', obj.description);
                newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';
            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstring.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMstring.percentageLabel).textContent = '---';
            }
        },

        deleteListItem: function (selectorID) {
            var el = document.getElementById(selectorID);
                    el.parentNode.removeChild(el);
        },

        clearFields: function () {
            var fields, fieldArr;
            fields = document.querySelectorAll(DOMstring.addDescription + ',' + DOMstring.addValue);
            fieldArr = Array.prototype.slice.call(fields);
            fieldArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldArr[0].focus();
        },

        displayPercentages: function (percentages) {
            var fields = document.querySelectorAll(DOMstring.expensesPercLabel);

            nodeListForEach(fields, function (current, index) {
                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '---';
                };
            });
        },

        displayDate: function () {
            var now, month, months, year;
        
            now = new Date();
            month = now.getMonth();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            year = now.getFullYear();
            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;
        },

        changeType: function () {
            var fields = document.querySelectorAll(DOMstring.addType + ',' + 
            DOMstring.addDescription + ',' +
            DOMstring.addValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstring.addBtn).classList.toggle('red');
        },

        getDOMstring: function () {
            return DOMstring;
        }
    }
})();


/*************** Global App Controller */
    var controller = (function (budgetCtrl, UICtrl) {

        var setEventListener = function () {
        var DOM = UICtrl.getDOMstring();   
        document.querySelector(DOM.addBtn).addEventListener('click', ctrlAddItem);
        /**************** Keyboard Event */
        document.addEventListener('keypress', function (event) {
        if (event.keyCode === 13 || event.which === 13) {
            ctrlAddItem();
        }
    });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        document.querySelector(DOM.addType).addEventListener('change', UICtrl.changeType);
        };

        var updateBudget = function () {
            // 1. Calculate the budget
            budgetCtrl.calculateBudget();
            // 2. Return the budget
            var budget = budgetCtrl.getBudget();
            // 3. Display the budget on the UI 
            UICtrl.displayBudget(budget);
        };

        var updatePercentages = function () {
            // 1. Calculate percentages
            budgetCtrl.calculatePercentage();

            // 2. Read percentages from the budget controller
            var percentages = budgetCtrl.getPercentage();

            // 3. Update the UI with the new percentages
            UICtrl.displayPercentages(percentages);
        }
    
    var ctrlAddItem = function () {
        var input, newItem;
        // 1. Get the field input Data
        input = UICtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItems(input.type, input.description, input.value);

            // 3.Add the item to the UI 
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget(); 

             // 6. Calculate and update percentages
            updatePercentages(); 
        
        }
    
    };

    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. delete the item from the data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. delete the item from the UI
            UICtrl.deleteListItem(itemID);

            // 3. update and show the new budget
            updateBudget(); 

            // 4. Calculate and update percentages
            updatePercentages(); 
        };
    };

    return {
        init: function () {
            console.log('Application has started');
            UICtrl.displayDate();
            UICtrl.displayBudget( {
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0});
            setEventListener();
        }
    };
    })(budgetController, UIController);

    controller.init();


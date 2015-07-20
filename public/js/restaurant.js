/**
 * Created by Lunding on 17/07/15.
 */

var meals = [];

$( document ).ready(function() {
    loadMeals();
});

function loadMeals(){
    //TODO: load meals
    meals.push(new Meal("Title1", "description", "burger.jpg", 20));
    meals.push(new Meal("Title2", "description", "burger.jpg", 20));
    meals.push(new Meal("Title3", "description", "burger.jpg", 20));

    updateGui();
}

function addmeal(){
    var meal = new Meal("", "","", "");
    meal.doSomething();
    updateGui();
}

function updateGui(){
    $("#meals").empty();
    for (i = 0; i < meals.length; i++){
        $("#meals").append(meals[i].generateHtml());
    }
}

function Meal(title, description, image, price) {
    this.title = title;
    this.description = description;
    this.image = image;
    this.price = price;

    this.generateHtml = function(){
        return '<li><div class="panel panel-default restaurant-card"><div class="panel-heading"><p>' + this.title +'</p></div><div class="panel-body"><div class="panel-info"> <p>info</p></div></div><div class="panel-footer"><p>footer</p></div></div></li>';
    }
}

function removeMeal(meal){
    var index = meals.indexOf(meal);
    if (index > -1){
        meals.splice(index, 1);
    }
    updateGui();
}


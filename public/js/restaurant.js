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
    $("#viewmeals").hide(1000);
    scrollToTop();
    $("#addmeal").show(1000);
}

function showmeals(){
    $("#addmeal").hide(500);
    scrollToTop();
    $("#viewmeals").show(500);
}

function createmeal(){
    var title = $("#title");
    var image = $("#image");
    var price = $("#price");
    var description = $("#description");

    //TODO: validation

    $(".form-group").removeClass("has-error");
    var hasErrors = false;

    if (!title.val()){
        title.closest('div[class^="form-group"]').addClass("has-error");
        hasErrors = true;
    }
    if (!image.val()){
        image.closest('div[class^="form-group"]').addClass("has-error");
        hasErrors = true;
    }
    if (!price.val() || !IsNumeric(price.val()) || price.val() <= 0){
        price.closest('div[class^="form-group"]').addClass("has-error");
        hasErrors = true;
    }
    if (!description.val()){
        description.closest('div[class^="form-group"]').addClass("has-error");
        hasErrors = true;
    }

    if (hasErrors){
        scrollToTop();
        return;
    }

    var meal = new Meal(title.val(), description.val(), image.val(), price.val());
    //TODO: update to server
    meals.push(meal);
    updateGui();
    showmeals();
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

function scrollToTop(){
    $("html, body").animate({ scrollTop: 0 }, "slow");
}

function IsNumeric(input) {
    return (input - 0) == input && (''+input).trim().length > 0;
}
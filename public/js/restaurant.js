/**
 * Created by Lunding on 17/07/15.
 */

var meals = [];

$( document ).ready(function() {
    loadMeals();
});

function loadMeals(){
    //TODO: load meals


    for (i = 0; i < meals.length; i++){
        $("#meals").append(meals[i].generateHtml());
    }
    $("#meals").empty();
    var restaurantId = $("#restaurant-id").val();
    if (!restaurantId){
        return;
    }
    console.log("Retrieving meals from restaurant with id: " + restaurantId);
    $.getJSON("/api/getMeals.json?restaurant_id=" + restaurantId, function(result){
        console.log(result);
        for (var i = 0; i < result.length; i++){
            $("#meals").append(generateMealHtml(result[i]["title"], result[i]["description"], result[i]["price"], result[i]["image"], result[i]["id"]));
        }
        $(".meal-card").click(function(){
            var result = confirm("Want to delete?");
            if (result){
                var mealId = $(this).find("img").attr("id");
                console.log("Deleting: " + mealId);
                deleteMeal(mealId);
            }
        });
    });
}

function addmeal(){
    $("#viewmeals").slideUp(1000);
    scrollToTop();
    $("#addmeal").slideDown(1000);
}

function showmeals(){
    $("#addmeal").slideUp(500);
    scrollToTop();
    $("#viewmeals").slideDown(500);
}

function createmeal(){
    var title = $("#title");
    var image = $("#image");
    var price = $("#price");
    var description = $("#description");
    var restaurantId = $("#restaurant-id");

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
    if (!restaurantId.val()){
        restaurantId.closest('div[class^="form-group"]').addClass("has-error");
        hasErrors = true;
    }

    if (hasErrors){
        scrollToTop();
        return;
    }

    $.post("/api/createMeal.json",
        {
            title: title.val(),
            description: description.val(),
            price: price.val(),
            image: image.val(),
            restaurant_id: restaurantId.val()
        },
        function(data, status){
            console.log("Data: " + data + "\nStatus: " + status);
            if (data["status"] === "success"){
                loadMeals();
                showmeals();
            } else {
                //Show error
            }
        }
    );
}

/*function generateMealHtml(title, description, image, price, id){
    return '<li><div class="panel panel-default restaurant-card"><div class="panel-heading"><p>' + title +'</p></div><div class="panel-body"><div class="panel-info"> <p>info</p></div></div><div class="panel-footer"><p>footer</p></div></div></li>';
}*/

function deleteMeal(meal_id){
    $.post("/api/delMeals.json",
        {
            meal_id: meal_id
        },
        function(data, status){
            console.log("Data: " + data + "\nStatus: " + status);
            if (data["status"] === "success"){
                loadMeals();
                showmeals();
            } else {
                //Show error
            }
        }
    );
}

function generateMealHtml(title, description, price, image, id){
    price = price / 100;
    return '<div class="col-md-6"><div class="panel panel-default meal-card"><div class="panel-body"><div class="panel-info"><div><img src="img/'+image+'" id="'+id+'"></div></div></div><div class="panel-footer"> <h3>'+title+'</h3> <p>'+description+' ($'+price+')</p></div></div></div>';
}

function scrollToTop(){
    $("html, body").animate({ scrollTop: 0 }, "slow");
}

function IsNumeric(input) {
    return (input - 0) == input && (''+input).trim().length > 0;
}
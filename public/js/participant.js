/**
 * Created by Lunding on 16/07/15.
 *
 * Endpoint:
 * http://localhost:9393/api/participant.json?hash=09dacfbb139cb077f34037db4d5e260ea24c2fce
 * User link:
 * http://localhost:9393/participant?hash=09dacfbb139cb077f34037db4d5e260ea24c2fce
 */

var meal = 0;
var hash;


function loadImages(){

    hash = getUrlParameter("hash");
    console.log(hash);
    $.getJSON("/api/participant.json?hash=" + hash, function (result) {
        console.log(result);
        var container = $("#meal-list").empty();
        var rowDiv;
        for (var i = 0; i < result.length; i++){
            console.log(result[i]);
            if (i%2 == 0){
                rowDiv = $('<div class="row"></div>');
            }
            rowDiv.append(generateMealHtml(result[i]["title"], result[i]["description"], result[i]["price"], result[i]["image"], result[i]["id"]));
            if (i%2 == 1){
                container.append(rowDiv);
            }
        }
        if (result.length%2 == 1){
            container.append(rowDiv);
        }
        setOnClickListener();
    });
}

function generateMealHtml(title, description, price, image, id){
    price = price / 100;
    return '<div class="col-md-6"><div class="panel panel-default restaurant-card"><div class="panel-body"><div class="panel-info"><div><img src="img/'+image+'" id="'+id+'"></div></div></div><div class="panel-footer"> <h3>'+title+'</h3> <p>'+description+' ($'+price+')</p></div></div></div>';
}

function submit() {
    $("#mealInformation").slideUp(1000);
    scrollToTop();
    $("#workingInformation").slideDown(500);
    $.post("/api/updateMeal.json",
        {
            hash: hash,
            meal_id: meal
        },
        function(data, status){
            console.log("Data: " + data + "\nStatus: " + status);
            if (data["status"] === "success"){
                $("#workingInformation").slideUp(500);
                $("#successInformation").show(1000);
            } else {
                $("#workingInformation").slideUp(500);
                $("#failInformation").show(1000);
            }
        }
    );
}

$( document ).ready(function() {
    loadImages();
});

function setOnClickListener(){
    $(".restaurant-card").click(function(){
        $(".restaurant-card").removeClass("picked-card");
        $(this).addClass("picked-card");
        meal = $(this).find("img").attr("id");
        $("#submitButton").slideDown(100);
    });
}

function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam) {
            return sParameterName[1];
        }
    }
}
function scrollToTop(){
    $("html, body").animate({ scrollTop: 0 }, "slow");
}